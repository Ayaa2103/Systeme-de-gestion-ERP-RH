import email
import imaplib
import os
import re
import time
import threading
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from recruitment.models import Application, JobOffer

class Command(BaseCommand):
    help = 'Run email server to automatically process incoming applications'

    def add_arguments(self, parser):
        parser.add_argument('--check-interval', type=int, default=5, help='Check emails every X minutes (default: 5)')

    def handle(self, *args, **options):
        check_interval = options['check_interval']
        
        self.stdout.write(
            self.style.SUCCESS(f'Demarrage du serveur email automatique')
        )
        self.stdout.write(f'Surveillance de: {settings.EMAIL_HOST_USER}')
        self.stdout.write(f'Verification toutes les {check_interval} minutes')
        self.stdout.write('Appuyez sur Ctrl+C pour arreter\n')
        
        try:
            while True:
                try:
                    self.process_incoming_emails()
                    time.sleep(check_interval * 60)  # Convert to seconds
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Erreur: {e}')
                    )
                    self.stdout.write(f'Nouvelle tentative dans {check_interval} minutes...')
                    time.sleep(check_interval * 60)
                    
        except KeyboardInterrupt:
            self.stdout.write(self.style.SUCCESS('\nServeur email arrete'))

    def process_incoming_emails(self):
        """Process incoming emails for job applications"""
        email_address = getattr(settings, 'EMAIL_HOST_USER', None)
        password = getattr(settings, 'EMAIL_HOST_PASSWORD', None)
        server = getattr(settings, 'EMAIL_IMAP_SERVER', 'imap.gmail.com')

        if not email_address or not password:
            self.stdout.write(self.style.ERROR('Configuration email manquante'))
            return

        try:
            # Connect to email server
            mail = imaplib.IMAP4_SSL(server)
            mail.login(email_address, password)
            mail.select('inbox')

            # Search for ONLY unread emails with candidature/application in subject
            status, messages = mail.search(None, 'UNSEEN SUBJECT "candidature"')
            if status != 'OK' or not messages[0]:
                status, messages = mail.search(None, 'UNSEEN SUBJECT "application"')

            if not messages[0]:
                timestamp = datetime.now().strftime('%H:%M:%S')
                self.stdout.write(f'[{timestamp}] Aucun nouvel email de candidature')
                mail.close()
                mail.logout()
                return

            email_ids = messages[0].split()
            processed_count = 0

            for email_id in email_ids:
                try:
                    # Fetch email
                    status, msg_data = mail.fetch(email_id, '(RFC822)')
                    if status != 'OK':
                        continue

                    # Parse email
                    msg = email.message_from_bytes(msg_data[0][1])
                    
                    # Get sender and recipient info
                    sender_email = msg['From']
                    to_email = msg.get('To', '')
                    subject = msg.get('Subject', '')
                    
                    # Skip if this email was sent BY our account (not TO our account)
                    if email_address in sender_email:
                        self.stdout.write(f'Ignorer email envoye par nous: {subject}')
                        mail.store(email_id, '+FLAGS', '\\Seen')
                        continue
                    
                    # Verify this email was sent TO our address
                    if email_address not in to_email and email_address not in msg.get('Delivered-To', ''):
                        self.stdout.write(f'Email non destine a notre adresse: {subject}')
                        continue
                    
                    # Extract candidate information
                    candidate_info = self.extract_candidate_info(sender_email, subject, msg)
                    
                    if not candidate_info:
                        self.stdout.write(f'Impossible d\'extraire les infos: {subject}')
                        continue
                    
                    # Find or get default job offer
                    job_offer = self.find_job_offer(subject, self.get_email_body(msg))
                    if not job_offer:
                        job_offer = JobOffer.objects.filter(status='published').first()
                    
                    if not job_offer:
                        self.stdout.write(f'Aucune offre d\'emploi disponible')
                        continue

                    # Check for duplicates
                    if Application.objects.filter(
                        email=candidate_info['email'],
                        job_offer=job_offer,
                        source='email'
                    ).exists():
                        self.stdout.write(f'Candidature deja existante: {candidate_info["email"]}')
                        mail.store(email_id, '+FLAGS', '\\Seen')
                        continue

                    # Get CV attachment
                    cv_file = self.extract_cv_attachment(msg)

                    # Create application
                    application = Application.objects.create(
                        job_offer=job_offer,
                        first_name=candidate_info['first_name'],
                        last_name=candidate_info['last_name'],
                        email=candidate_info['email'],
                        phone=candidate_info['phone'],
                        cover_letter=candidate_info['cover_letter'],
                        cv=cv_file,
                        source='email'
                    )

                    processed_count += 1
                    timestamp = datetime.now().strftime('%H:%M:%S')
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'[{timestamp}] Nouvelle candidature: {application.full_name} -> {job_offer.title}'
                        )
                    )

                    # Mark email as read
                    mail.store(email_id, '+FLAGS', '\\Seen')

                except Exception as e:
                    self.stdout.write(f'Erreur traitement email {email_id}: {str(e)}')
                    continue

            mail.close()
            mail.logout()

            if processed_count == 0:
                timestamp = datetime.now().strftime('%H:%M:%S')
                self.stdout.write(f'[{timestamp}] Aucune nouvelle candidature')

        except Exception as e:
            self.stdout.write(f'Erreur connexion email: {str(e)}')

    def extract_candidate_info(self, sender_email, subject, msg):
        """Extract candidate information from email"""
        try:
            # Extract email address
            email_match = re.search(r'[\w\.-]+@[\w\.-]+', sender_email)
            candidate_email = email_match.group(0) if email_match else sender_email

            # Extract name from sender or subject
            name_match = re.search(r'([A-Za-zÀ-ÿ]+)\s+([A-Za-zÀ-ÿ]+)', sender_email)
            if name_match:
                first_name = name_match.group(1)
                last_name = name_match.group(2)
            else:
                # Try from subject
                name_match = re.search(r'candidature\s+([A-Za-zÀ-ÿ]+)\s+([A-Za-zÀ-ÿ]+)', subject, re.IGNORECASE)
                if name_match:
                    first_name = name_match.group(1)
                    last_name = name_match.group(2)
                else:
                    # Use email prefix
                    email_prefix = candidate_email.split('@')[0]
                    name_parts = email_prefix.replace('.', ' ').replace('_', ' ').split()
                    if len(name_parts) >= 2:
                        first_name = name_parts[0].capitalize()
                        last_name = name_parts[1].capitalize()
                    else:
                        first_name = email_prefix.capitalize()
                        last_name = "Candidat"

            # Extract phone and cover letter from body
            body = self.get_email_body(msg)
            phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}', body)
            phone = phone_match.group(0) if phone_match else ""

            return {
                'first_name': first_name,
                'last_name': last_name,
                'email': candidate_email,
                'phone': phone,
                'cover_letter': body[:1000]  # Limit to 1000 chars
            }
        except:
            return None

    def get_email_body(self, msg):
        """Extract text body from email message"""
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    break
        else:
            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
        return body

    def extract_cv_attachment(self, msg):
        """Extract CV attachment from email"""
        for part in msg.walk():
            if part.get_content_disposition() == 'attachment':
                filename = part.get_filename()
                if filename and any(ext in filename.lower() for ext in ['.pdf', '.doc', '.docx']):
                    cv_content = part.get_payload(decode=True)
                    return ContentFile(cv_content, name=filename)
        return None

    def find_job_offer(self, subject, body):
        """Try to find matching job offer from email content"""
        job_offers = JobOffer.objects.filter(status='published')
        
        for job_offer in job_offers:
            if job_offer.title.lower() in subject.lower() or job_offer.title.lower() in body.lower():
                return job_offer
        
        return None