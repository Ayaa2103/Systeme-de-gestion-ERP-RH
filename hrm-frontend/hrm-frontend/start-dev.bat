@echo off
echo ========================================
echo   Démarrage HRM Frontend React
echo ========================================
echo.

echo Vérification des dépendances...
if not exist node_modules (
    echo Installation des dépendances...
    npm install
)

echo.
echo Démarrage du serveur de développement...
echo URL: http://localhost:3000
echo.
echo Pour arrêter le serveur, appuyez sur Ctrl+C
echo.

npm start