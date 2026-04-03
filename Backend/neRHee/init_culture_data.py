import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newRH.settings')
django.setup()

from company_culture.models import CompanyPage

def init_culture_pages():
    """Initialise les pages de culture d'entreprise avec du contenu par défaut"""
    
    pages_data = [
        {
            'page_type': 'vision_mission',
            'title': 'Vision & Mission',
            'content': '''Notre Vision:
Devenir le leader dans notre domaine en offrant des solutions innovantes et durables qui transforment positivement la vie de nos clients et de nos communautés.

Notre Mission:
Nous nous engageons à fournir des services de qualité exceptionnelle en:
• Plaçant nos clients au cœur de nos préoccupations
• Développant continuellement les compétences de nos équipes
• Innovant pour répondre aux défis de demain
• Respectant nos valeurs fondamentales dans toutes nos actions
• Contribuant au développement durable de notre société'''
        },
        {
            'page_type': 'values',
            'title': 'Nos Valeurs',
            'content': '''Nos valeurs fondamentales guident chacune de nos actions:

🎯 EXCELLENCE
Nous visons l'excellence dans tout ce que nous faisons, en nous fixant des standards élevés et en nous améliorant continuellement.

🤝 INTÉGRITÉ
Nous agissons avec honnêteté, transparence et éthique dans toutes nos relations professionnelles et personnelles.

💡 INNOVATION
Nous encourageons la créativité, l'innovation et la prise d'initiative pour trouver des solutions nouvelles et efficaces.

🌟 RESPECT
Nous respectons la diversité, les opinions et la dignité de chacun, créant un environnement inclusif et bienveillant.

🚀 COLLABORATION
Nous travaillons ensemble, partageons nos connaissances et nous soutenons mutuellement pour atteindre nos objectifs communs.'''
        },
        {
            'page_type': 'policies',
            'title': 'Politiques Internes',
            'content': '''Nos politiques internes encadrent notre fonctionnement quotidien:

📋 POLITIQUE DE TÉLÉTRAVAIL
• Flexibilité dans l'organisation du travail
• Équilibre vie professionnelle/vie personnelle
• Outils et support technique adaptés

🎓 POLITIQUE DE FORMATION
• Développement continu des compétences
• Budget formation annuel par employé
• Accompagnement personnalisé des carrières

🌈 POLITIQUE DE DIVERSITÉ ET INCLUSION
• Égalité des chances pour tous
• Lutte contre toute forme de discrimination
• Promotion de la diversité culturelle et sociale

🌱 POLITIQUE ENVIRONNEMENTALE
• Engagement pour le développement durable
• Réduction de notre empreinte carbone
• Sensibilisation aux enjeux écologiques

🔒 POLITIQUE DE CONFIDENTIALITÉ
• Protection des données personnelles et professionnelles
• Respect du RGPD
• Sécurité des informations sensibles'''
        },
        {
            'page_type': 'ethics',
            'title': 'Code d\'Éthique',
            'content': '''Notre code d'éthique définit les principes de conduite que nous respectons:

⚖️ RESPECT DES LOIS ET RÉGLEMENTATIONS
Nous respectons scrupuleusement toutes les lois et réglementations applicables à nos activités.

🚫 PRÉVENTION DES CONFLITS D'INTÉRÊTS
Nous évitons toute situation pouvant créer un conflit entre nos intérêts personnels et professionnels.

🔐 PROTECTION DES INFORMATIONS CONFIDENTIELLES
Nous protégeons les informations confidentielles de l'entreprise, de nos clients et partenaires.

👥 RESPECT DE LA DIGNITÉ HUMAINE
Nous traitons chaque personne avec respect, dignité et équité, sans discrimination.

🌍 RESPONSABILITÉ SOCIALE ET ENVIRONNEMENTALE
Nous assumons notre responsabilité envers la société et l'environnement.

💬 TRANSPARENCE DANS LES COMMUNICATIONS
Nous communiquons de manière honnête, claire et transparente.

⚖️ ÉQUITÉ DANS LES RELATIONS PROFESSIONNELLES
Nous maintenons des relations équitables avec tous nos partenaires commerciaux.

📞 SIGNALEMENT DES VIOLATIONS
Nous encourageons le signalement de toute violation de ce code d'éthique.'''
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for page_data in pages_data:
        page, created = CompanyPage.objects.get_or_create(
            page_type=page_data['page_type'],
            defaults={
                'title': page_data['title'],
                'content': page_data['content']
            }
        )
        
        if created:
            created_count += 1
            print(f"✓ Page créée: {page.title}")
        else:
            # Mettre à jour le contenu si la page existe déjà mais est vide
            if not page.content.strip() or page.content == 'Content coming soon...':
                page.title = page_data['title']
                page.content = page_data['content']
                page.save()
                updated_count += 1
                print(f"↻ Page mise à jour: {page.title}")
            else:
                print(f"- Page existe déjà avec du contenu: {page.title}")
    
    print(f"\nRésumé:")
    print(f"Pages créées: {created_count}")
    print(f"Pages mises à jour: {updated_count}")
    print(f"Total des pages: {CompanyPage.objects.count()}")

if __name__ == '__main__':
    print("Initialisation des pages de culture d'entreprise...")
    init_culture_pages()
    print("Initialisation terminée!")