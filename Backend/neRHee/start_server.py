#!/usr/bin/env python
"""
Script de démarrage du serveur Django avec les APIs
"""
import subprocess
import sys
import os

def main():
    print("=== Démarrage du serveur ERP RH ===\n")
    
    # Vérifier que nous sommes dans le bon répertoire
    if not os.path.exists('manage.py'):
        print("Erreur: manage.py non trouvé. Assurez-vous d'être dans le répertoire du projet.")
        return
    
    print("1. Vérification des migrations...")
    try:
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        print("   [OK] Migrations appliquées")
    except subprocess.CalledProcessError:
        print("   [ERREUR] Problème avec les migrations")
        return
    
    print("\n2. APIs disponibles:")
    print("   - Authentication: http://localhost:8000/api/v1/auth/")
    print("   - Employees: http://localhost:8000/api/v1/employees/")
    print("   - Requests: http://localhost:8000/api/v1/leave-requests/")
    print("   - Recruitment: http://localhost:8000/api/v1/job-offers/")
    print("   - Documentation complète: voir API_DOCUMENTATION.md")
    
    print("\n3. Configuration CORS pour React:")
    print("   - Frontend autorisé: http://localhost:3000")
    print("   - Authentification: Token-based")
    
    print("\n4. Démarrage du serveur Django...")
    print("   URL: http://localhost:8000")
    print("   Admin: http://localhost:8000/admin/")
    print("   APIs: http://localhost:8000/api/v1/")
    
    print("\n   Appuyez sur Ctrl+C pour arrêter le serveur")
    print("=" * 50)
    
    try:
        subprocess.run([sys.executable, "manage.py", "runserver"], check=True)
    except KeyboardInterrupt:
        print("\n\nServeur arrêté.")
    except subprocess.CalledProcessError as e:
        print(f"\nErreur lors du démarrage: {e}")

if __name__ == "__main__":
    main()