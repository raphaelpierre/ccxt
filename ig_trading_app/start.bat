@echo off
REM Script de démarrage rapide pour IG Trading App (Windows)

echo 🚀 IG Trading App - Démarrage...

REM Vérifier si l'environnement virtuel existe
if not exist "venv" (
    echo 📦 Création de l'environnement virtuel...
    python -m venv venv
)

REM Activer l'environnement virtuel
echo ✅ Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installer les dépendances
echo 📥 Installation des dépendances...
pip install -q -r requirements.txt

REM Vérifier si .env existe
if not exist ".env" (
    echo ⚠️  Fichier .env manquant
    echo 📝 Copie de .env.example vers .env...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Éditez le fichier .env avec vos identifiants IG Markets
    echo.
)

REM Lancer l'application
echo 🌐 Lancement de l'application...
echo 📍 Accédez à l'application sur: http://localhost:5000
echo.
python app.py

pause
