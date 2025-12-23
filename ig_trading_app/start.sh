#!/bin/bash
# Script de démarrage rapide pour IG Trading App

echo "🚀 IG Trading App - Démarrage..."

# Vérifier si l'environnement virtuel existe
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
echo "✅ Activation de l'environnement virtuel..."
source venv/bin/activate

# Installer les dépendances
echo "📥 Installation des dépendances..."
pip install -q -r requirements.txt

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant"
    echo "📝 Copie de .env.example vers .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Éditez le fichier .env avec vos identifiants IG Markets"
    echo ""
fi

# Lancer l'application
echo "🌐 Lancement de l'application..."
echo "📍 Accédez à l'application sur: http://localhost:5000"
echo ""
python app.py
