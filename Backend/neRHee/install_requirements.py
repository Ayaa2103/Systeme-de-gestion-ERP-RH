import subprocess
import sys

def install_package(package):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"[OK] {package} installe avec succes")
    except subprocess.CalledProcessError:
        print(f"[ERREUR] Erreur lors de l'installation de {package}")

packages = [
    "djangorestframework>=3.14.0",
    "django-cors-headers>=4.3.0",
    "djangorestframework-simplejwt>=5.3.0"
]

print("Installation des packages requis pour l'API...")
for package in packages:
    install_package(package)

print("\nInstallation terminée!")
print("Vous pouvez maintenant exécuter: py manage.py makemigrations")