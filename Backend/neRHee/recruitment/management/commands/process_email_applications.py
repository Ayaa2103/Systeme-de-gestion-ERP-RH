import email
import imaplib
import os
import re
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from recruitment.models import Application, JobOffer

class Command(BaseCommand):
    help = 'Process email applications and create Application records'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email address to check')
        parser.add_argument('--password', type=str, help='Email password')
        parser.add_argument('--server', type=str, default='imap.gmail.com', help='IMAP server')

    def handle(self, *args, **options):
        email_address = options.get('email') or getattr(settings, 'EMAIL_HOST_USER', None)
        password = options.get('password') or getattr(settings, 'EMAIL_HOST_PASSWORD', None)
        server = options.get('server') or getattr(settings, 'EMAIL_IMAP_SERVER', 'imap.gmail.com')

        if not email_address or not password:
            self.stdout.write(self.style.ERROR('Email credentials not provided'))
            return

        try:
            # Connect to email server
            mail = imaplib.IMAP4_SSL(server)
            mail.login(email_address, password)
            mail.select('inbox')

            # Search for ONLY unread emails with subject containing "candidature" or "application"
            status, messages = mail.search(None, f'UNSEEN SUBJECT "candidature" NOT FROM "{email_address}"')
            if status != 'OK' or not messages[0]:
                status, messages = mail.search(None, f'UNSEEN SUBJECT "application" NOT FROM "{email_address}"')

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
                    
                    # Extract sender info
                    sender_email = msg['From']
                    subject = msg['Subject'] or ''
                    
                    # Skip if email is from the same account (avoid processing own emails)
                    if email_address in sender_email:
                        self.stdout.write(self.style.WARNING(f'Skipping email from same account: {sender_email}'))
                        continue
                    
                    # Extract email address first
                    email_match = re.search(r'[\w\.-]+@[\w\.-]+', sender_email)
                    candidate_email = email_match.group(0) if email_match else sender_email
                    
                    # Extract name from email or subject
                    name_match = re.search(r'([A-Za-z]+)\s+([A-Za-z]+)', sender_email)
                    if name_match:
                        first_name = name_match.group(1)
                        last_name = name_match.group(2)
                    else:
                        # Try to extract from subject
                        name_match = re.search(r'candidature\s+([A-Za-z\u00c0-\u017f]+)\s+([A-Za-z\u00c0-\u017f]+)', subject, re.IGNORECASE)
                        if name_match:
                            first_name = name_match.group(1)
                            last_name = name_match.group(2)
                        else:
                            # Use email prefix as name
                            email_prefix = candidate_email.split('@')[0]
                            name_parts = email_prefix.replace('.', ' ').replace('_', ' ').split()
                            if len(name_parts) >= 2:
                                first_name = name_parts[0].capitalize()
                                last_name = name_parts[1].capitalize()
                            else:
                                first_name = email_prefix.capitalize()
                                last_name = "Candidat"

                    # Extract body text
                    body = self.get_email_body(msg)
                    
                    # Extract phone number from body
                    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}', body)
                    phone = phone_match.group(0) if phone_match else ""

                    # Find job offer (try to match from subject or use first available)
                    job_offer = self.find_job_offer(subject, body)
                    if not job_offer:
                        job_offer = JobOffer.objects.filter(status='published').first()
                    
                    if not job_offer:
                        self.stdout.write(self.style.WARNING(f'No job offer found for email: {subject}'))
                        continue

                    # Check if application already exists to avoid duplicates
                    existing_application = Application.objects.filter(
                        email=candidate_email,
                        job_offer=job_offer,
                        source='email'
                    ).first()
                    
                    if existing_application:
                        self.stdout.write(self.style.WARNING(f'Application already exists for {candidate_email} - {job_offer.title}'))
                        continue

                    # Check for attachments (CV)
                    cv_file = None
                    for part in msg.walk():
                        if part.get_content_disposition() == 'attachment':
                            filename = part.get_filename()
                            if filename and any(ext in filename.lower() for ext in ['.pdf', '.doc', '.docx']):
                                cv_content = part.get_payload(decode=True)
                                cv_file = ContentFile(cv_content, name=filename)
                                break

                    # Create application
                    application = Application.objects.create(
                        job_offer=job_offer,
                        first_name=first_name,
                        last_name=last_name,
                        email=candidate_email,
                        phone=phone,
                        cover_letter=body[:1000],  # Limit to 1000 chars
                        cv=cv_file,
                        source='email'
                    )

                    processed_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created application: {application.full_name} for {job_offer.title}')
                    )

                    # Mark email as read
                    mail.store(email_id, '+FLAGS', '\\Seen')

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing email {email_id}: {str(e)}'))
                    continue

            mail.close()
            mail.logout()

            self.stdout.write(
                self.style.SUCCESS(f'Successfully processed {processed_count} email applications')
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error connecting to email: {str(e)}'))

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

    def find_job_offer(self, subject, body):
        """Try to find matching job offer from email content"""
        # Look for job title in subject or body
        job_offers = JobOffer.objects.filter(status='published')
        
        for job_offer in job_offers:
            if job_offer.title.lower() in subject.lower() or job_offer.title.lower() in body.lower():
                return job_offer
        
        return None