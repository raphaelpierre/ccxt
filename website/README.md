# Site Vitrine pour Artiste Peintre

Un site web moderne et élégant pour présenter et gérer vos œuvres d'art et collections de peintures.

## 🎨 Fonctionnalités

### Pour les Visiteurs
- **Page d'accueil** avec présentation de l'artiste
- **Galerie interactive** avec filtres par collection
- **Lightbox** pour visualiser les œuvres en grand format
- **Navigation fluide** entre les œuvres
- **Design responsive** adapté à tous les appareils (mobile, tablette, desktop)
- **Formulaire de contact**

### Pour l'Artiste
- **Interface d'administration intuitive** accessible sans compétences techniques
- **Gestion des collections** : création, modification, suppression
- **Gestion des œuvres** : ajout, modification, suppression
- **Upload d'images** pour vos toiles
- **Mise en vedette** des œuvres favorites
- **Export/Import des données** au format JSON
- **Sauvegarde automatique** dans le navigateur

## 📁 Structure du Projet

```
website/
├── index.html          # Page d'accueil
├── gallery.html        # Page galerie
├── admin.html          # Interface d'administration
├── css/
│   └── styles.css      # Tous les styles du site
├── js/
│   ├── main.js         # Script principal et gestion des données
│   ├── gallery.js      # Script pour la galerie et lightbox
│   └── admin.js        # Script pour l'interface admin
├── data/
│   └── sample-data.json # Fichier de données exemple
└── images/
    ├── artworks/       # Dossier pour les images de vos œuvres
    └── artist-placeholder.jpg # Photo de l'artiste (à remplacer)
```

## 🚀 Installation et Utilisation

### 1. Ouvrir le Site

Le site fonctionne entièrement côté client, sans serveur nécessaire :

**Option A : Ouvrir directement les fichiers**
- Double-cliquez sur `index.html` pour ouvrir le site dans votre navigateur

**Option B : Utiliser un serveur local (recommandé)**
```bash
# Si vous avez Python installé :
cd website
python -m http.server 8000

# Ou avec Node.js :
npx http-server -p 8000

# Puis ouvrez : http://localhost:8000
```

### 2. Personnaliser le Site

#### Modifier les Informations de l'Artiste

1. Ouvrez `index.html`
2. Recherchez la section `<section class="about">`
3. Modifiez le texte de présentation
4. Ajoutez votre photo dans `images/artist-placeholder.jpg`

#### Modifier les Informations de Contact

Dans `index.html`, section `<section class="contact">` :
```html
<p><strong>Email:</strong> votre-email@exemple.fr</p>
<p><strong>Téléphone:</strong> +33 6 XX XX XX XX</p>
```

### 3. Gérer vos Collections et Œuvres

#### Accéder à l'Interface d'Administration

1. Ouvrez le site
2. Cliquez sur le bouton **"Admin"** dans le menu
3. Ou accédez directement à `admin.html`

#### Créer une Collection

1. Dans l'admin, cliquez sur l'onglet **"Collections"**
2. Cliquez sur **"+ Créer une Collection"**
3. Remplissez :
   - Nom de la collection
   - Description
   - Année
4. Cliquez sur **"Enregistrer"**

#### Ajouter une Œuvre

1. **Préparez votre image** :
   - Placez l'image dans le dossier `images/artworks/`
   - Formats recommandés : JPG, PNG
   - Résolution recommandée : 1920x1080px ou plus

2. Dans l'admin, onglet **"Œuvres"**
3. Cliquez sur **"+ Ajouter une Œuvre"**
4. Remplissez le formulaire :
   - **Titre** : Nom de l'œuvre
   - **Description** : Description détaillée
   - **Collection** : Choisissez une collection (optionnel)
   - **Année** : Année de création
   - **Dimensions** : Ex: "60x80 cm"
   - **Prix** : Ex: "450€" (optionnel)
   - **URL de l'Image** : `images/artworks/nom-de-votre-image.jpg`
   - **Mettre en vedette** : Cochez pour afficher sur la page d'accueil

5. Cliquez sur **"Enregistrer"**

#### Modifier ou Supprimer

- Cliquez sur **"Modifier"** pour éditer une œuvre ou collection
- Cliquez sur **"Supprimer"** pour la retirer (confirmation demandée)

### 4. Sauvegarde et Restauration

#### Exporter vos Données

1. Dans l'admin, onglet **"Import/Export"**
2. Cliquez sur **"Télécharger JSON"**
3. Un fichier `portfolio-backup-YYYY-MM-DD.json` sera téléchargé

**Recommandation** : Faites des sauvegardes régulières !

#### Importer des Données

1. Dans l'admin, onglet **"Import/Export"**
2. Cliquez sur **"Importer JSON"**
3. Sélectionnez votre fichier de sauvegarde
4. Confirmez l'import (remplace les données actuelles)

#### Réinitialiser

Pour supprimer toutes les données :
1. Onglet **"Import/Export"**
2. Cliquez sur **"Tout Réinitialiser"**
3. Confirmez (action irréversible)

## 💾 Stockage des Données

Les données sont stockées dans **localStorage** de votre navigateur :
- ✅ Pas besoin de base de données
- ✅ Accès rapide
- ⚠️ Stockage limité à votre navigateur
- ⚠️ Peut être effacé si vous nettoyez les données du navigateur

**Important** : Faites des sauvegardes régulières avec la fonction Export !

## 🎨 Personnalisation Avancée

### Modifier les Couleurs

Éditez `css/styles.css`, section `/* Global Styles */` :

```css
:root {
    --primary-color: #2c3e50;      /* Couleur principale */
    --secondary-color: #e74c3c;    /* Couleur secondaire */
    --accent-color: #f39c12;       /* Couleur accent */
    --light-bg: #ecf0f1;           /* Fond clair */
}
```

### Modifier les Polices

Dans les fichiers HTML, section `<head>` :
```html
<link href="https://fonts.googleapis.com/css2?family=VotrePolice&display=swap" rel="stylesheet">
```

Puis dans `css/styles.css` :
```css
body {
    font-family: 'VotrePolice', sans-serif;
}
```

## 📱 Responsive Design

Le site s'adapte automatiquement à tous les écrans :
- **Desktop** : Large (> 992px)
- **Tablette** : Moyen (768px - 992px)
- **Mobile** : Petit (< 768px)

## 🌐 Mise en Ligne

### Option 1 : GitHub Pages (Gratuit)

1. Créez un compte sur [GitHub](https://github.com)
2. Créez un nouveau repository
3. Uploadez tous les fichiers du dossier `website/`
4. Dans Settings > Pages, activez GitHub Pages
5. Votre site sera accessible à `https://votre-nom.github.io/nom-du-repo`

### Option 2 : Netlify (Gratuit)

1. Créez un compte sur [Netlify](https://www.netlify.com)
2. Glissez-déposez le dossier `website/` sur Netlify
3. Votre site est en ligne en quelques secondes !

### Option 3 : Hébergement Web Classique

Uploadez simplement tous les fichiers via FTP sur votre hébergeur web.

## 🔒 Sécurité de l'Interface Admin

L'interface admin est accessible à tous par défaut. Pour la protéger :

### Option 1 : Protéger par .htaccess (Apache)

Créez un fichier `.htaccess` dans le dossier du site :
```apache
<Files "admin.html">
    AuthType Basic
    AuthName "Administration"
    AuthUserFile /chemin/vers/.htpasswd
    Require valid-user
</Files>
```

### Option 2 : Renommer la Page Admin

Renommez `admin.html` en quelque chose de moins évident, ex : `gestion-artiste-2024.html`

## 🆘 Aide et Dépannage

### Les images ne s'affichent pas
- Vérifiez que le chemin est correct : `images/artworks/nom-fichier.jpg`
- Vérifiez que l'image existe dans le dossier
- Utilisez des noms de fichiers sans espaces ni caractères spéciaux

### Mes données ont disparu
- Vérifiez que vous n'avez pas nettoyé les données du navigateur
- Restaurez une sauvegarde avec la fonction Import

### Le site ne fonctionne pas
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Vérifiez que tous les fichiers sont présents
- Essayez d'utiliser un serveur local au lieu d'ouvrir directement les fichiers

### Le menu ne s'affiche pas sur mobile
- Cliquez sur l'icône hamburger (☰) en haut à droite

## 📄 Licence

Ce site est fourni tel quel. Vous êtes libre de l'utiliser et de le modifier selon vos besoins.

## 🎉 Conseils pour Réussir

1. **Utilisez des images de haute qualité** - Elles représentent votre travail !
2. **Faites des sauvegardes régulières** - Exportez vos données après chaque modification importante
3. **Mettez à jour régulièrement** - Ajoutez vos nouvelles créations
4. **Optimisez vos images** - Compressez-les pour un chargement rapide (outils : TinyPNG, ImageOptim)
5. **Partagez votre site** - Ajoutez le lien dans vos réseaux sociaux et carte de visite

---

**Créé avec passion pour les artistes** 🎨

Pour toute question ou amélioration, n'hésitez pas à me contacter !
