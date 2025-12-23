# IG Trading App - Gestion Avancée TP/SL

Application web moderne pour gérer facilement vos positions sur **IG Markets** avec des fonctionnalités avancées de Take Profit et Stop Loss.

## 🎯 Fonctionnalités

### ✅ Placement Automatique TP/SL
- Configuration TP/SL lors de l'ouverture de position
- Choix entre niveau absolu ou distance en points
- Interface intuitive pour définir les niveaux

### 📊 Gestion/Modification des TP/SL Existants
- Modification en temps réel des niveaux TP/SL
- Interface visuelle pour chaque position ouverte
- Mise à jour instantanée via l'API IG Markets

### 🔄 Trailing Stop Loss
- Activation du trailing stop sur nouvelles positions
- Configuration de l'incrément de trailing
- Modification du trailing stop sur positions existantes

### 🎯 Take Profits Multiples (TP Partiel)
- Configuration de plusieurs niveaux de TP
- Définition du % de position à clôturer à chaque niveau
- Gestion automatique des TP successifs

### 🎨 Interface Visuelle Moderne
- Design responsive et intuitif
- Recherche de marchés en temps réel
- Affichage clair des positions ouvertes
- Notifications en temps réel

## 🚀 Installation

### Prérequis

- Python 3.9+
- Compte IG Markets (démo ou réel)
- API Key IG Markets (obtenir sur [IG Labs](https://labs.ig.com/))

### Étapes d'installation

1. **Cloner le repository**
```bash
cd ig_trading_app
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos identifiants IG Markets
```

5. **Lancer l'application**
```bash
python app.py
```

6. **Accéder à l'application**
Ouvrir votre navigateur : `http://localhost:5000`

## 📖 Guide d'utilisation

### 1. Connexion

- Entrer votre **API Key** IG Markets
- Entrer votre **Username** et **Password**
- Cocher **Compte Démo** pour utiliser l'environnement de test
- Cliquer sur **Se connecter**

### 2. Ouvrir une Position avec TP/SL

#### Position Simple avec TP/SL unique

1. **Rechercher un marché** (ex: EUR/USD, FTSE 100)
2. Sélectionner le marché dans les résultats
3. Choisir la **Direction** (BUY ou SELL)
4. Entrer la **Taille** de la position
5. Configurer le **Stop Loss** :
   - Type : Niveau absolu ou Distance
   - Valeur : Prix ou nombre de points
6. Configurer le **Take Profit** :
   - Type : Niveau absolu ou Distance
   - Valeur : Prix ou nombre de points
7. Cliquer sur **Ouvrir Position**

#### Position avec Trailing Stop

1. Suivre les étapes ci-dessus
2. Cocher **Trailing Stop Loss**
3. Définir l'**Incrément** de trailing (en points)
4. Le trailing stop suivra automatiquement le prix en votre faveur

#### Position avec Take Profits Multiples

1. Rechercher et sélectionner le marché
2. Cocher **Take Profits Multiples**
3. Cliquer sur **+ Ajouter TP** pour chaque niveau souhaité
4. Pour chaque TP, définir :
   - **Niveau Prix** : Prix cible du TP
   - **% de la position** : Pourcentage à clôturer (ex: 50% pour TP1, 50% pour TP2)
5. Configurer le Stop Loss
6. Ouvrir la position

**Exemple TP Multiples :**
- Position de 10 lots sur EUR/USD
- TP1 à 1.1000 → Clôture 50% (5 lots)
- TP2 à 1.1050 → Clôture 50% (5 lots restants)

### 3. Modifier une Position Existante

1. Dans le panneau **Positions Ouvertes**, cliquer sur **Modifier TP/SL**
2. Modifier les valeurs :
   - Nouveau Stop Loss
   - Nouveau Take Profit
   - Activer/Désactiver Trailing Stop
3. Cliquer sur **Sauvegarder**

### 4. Clôturer une Position

1. Cliquer sur **Clôturer** sur la position souhaitée
2. Confirmer la clôture
3. La position sera fermée au prix marché

## 🔧 Structure du Projet

```
ig_trading_app/
├── app.py                      # Backend Flask (routes API)
├── api/
│   └── ig_client.py           # Client API IG Markets
├── templates/
│   └── index.html             # Interface principale
├── static/
│   ├── css/
│   │   └── style.css         # Styles CSS
│   └── js/
│       └── app.js            # Logique client JavaScript
├── requirements.txt           # Dépendances Python
├── .env.example              # Template de configuration
└── README.md                 # Documentation
```

## 📡 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/authenticate` | POST | Authentification IG Markets |
| `/api/positions` | GET | Liste des positions ouvertes |
| `/api/positions/create` | POST | Créer nouvelle position |
| `/api/positions/<id>/update` | PUT | Modifier TP/SL |
| `/api/positions/<id>/close` | DELETE | Clôturer position |
| `/api/positions/<id>/partial-close` | POST | Clôture partielle |
| `/api/markets/search` | GET | Rechercher marchés |
| `/api/markets/<epic>` | GET | Info marché |

## 🛡️ Sécurité

- ✅ Utilisation de variables d'environnement pour les credentials
- ✅ Support compte démo pour les tests
- ✅ Validation des données côté serveur
- ✅ Gestion sécurisée des sessions

## ⚠️ Avertissements

- **Trading à risque** : Les CFDs et le trading comportent des risques de perte en capital
- **Tester en démo** : Toujours tester sur compte démo avant le réel
- **API Rate Limits** : Respecter les limites d'appels API d'IG Markets
- **Responsabilité** : L'utilisateur est responsable de ses transactions

## 🔗 Ressources

- [Documentation API IG Markets](https://labs.ig.com/rest-trading-api-reference)
- [IG Labs](https://labs.ig.com/)
- [Obtenir une API Key](https://labs.ig.com/gettingstarted)

## 📝 Licence

Ce projet est fourni à des fins éducatives. Utilisez-le à vos propres risques.

## 🤝 Support

Pour toute question ou problème :
1. Vérifier que votre API Key IG est valide
2. Vérifier que vous êtes sur le bon environnement (démo/réel)
3. Consulter les logs de l'application
4. Consulter la documentation API IG Markets

## 🎯 Roadmap / Améliorations futures

- [ ] Graphiques de prix en temps réel
- [ ] Alertes push/email
- [ ] Historique des transactions
- [ ] Calcul automatique de taille de position selon risque
- [ ] Support WebSocket pour prix en temps réel
- [ ] Stratégies de trading automatisées
- [ ] Backtesting intégré

---

**Bon trading ! 📈**
