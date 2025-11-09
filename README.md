# Bus Bénin - Application Web

Application web complète pour la réservation de trajets en bus au Bénin, développée avec React.js, Tailwind CSS et Supabase.

## 🚀 Fonctionnalités

### Pour les utilisateurs
- 🔍 **Recherche de trajets** - Recherche avancée avec filtres (départ, arrivée, compagnie, prix)
- 📱 **Interface responsive** - Design moderne et adaptatif pour tous les écrans
- ⭐ **Trajets populaires** - Affichage des trajets les mieux notés
- 💰 **Offres spéciales** - Visualisation des trajets aux meilleurs prix
- 🏢 **Compagnies recommandées** - Découverte des compagnies de transport
- ❤️ **Favoris** - Sauvegarde des trajets préférés
- 📅 **Réservations** - Système de réservation complet
- 👤 **Gestion de profil** - Modification des informations personnelles
- 💳 **Paiement en ligne** - Intégration FedaPay (à configurer)
- 🌙 **Mode sombre** - Thème clair/sombre automatique

### Sécurité
- 🔐 **Authentification** - Système d'inscription et connexion sécurisé
- 🛡️ **Protection des routes** - Routes protégées pour les utilisateurs connectés
- 🔑 **Gestion des sessions** - Sessions persistantes avec Supabase Auth

## 🛠️ Technologies

- **Frontend**: React 18, React Router DOM 6
- **Styling**: Tailwind CSS 3
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React
- **Build**: Vite 5

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Compte Supabase
- Compte FedaPay (optionnel, pour les paiements)

## 🚀 Installation

### 1. Cloner le projet

```bash
cd bus_pro/web
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
VITE_FEDAPAY_PUBLIC_KEY=votre_fedapay_public_key
```

### 4. Configuration Supabase

La base de données doit contenir les tables suivantes :
- `profiles` - Profils utilisateurs
- `compagnies` - Compagnies de transport
- `trajets` - Trajets disponibles
- `destinations` - Villes desservies
- `reservations` - Réservations
- `favoris` - Trajets favoris
- `avis` - Avis et notes

Voir le schéma complet dans le dossier mobile pour plus de détails.

### 5. Lancer l'application

```bash
# Mode développement
npm run dev

# Build pour production
npm run build

# Prévisualisation du build
npm run preview
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
web/
├── public/              # Fichiers statiques
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── TrajetCard.jsx
│   ├── contexts/        # Contextes React
│   │   ├── SessionProvider.jsx
│   │   └── ThemeProvider.jsx
│   ├── pages/          # Pages de l'application
│   │   ├── Home.jsx
│   │   ├── Trajets.jsx
│   │   ├── TrajetDetails.jsx
│   │   ├── Reservation.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── Reservations.jsx
│   │   ├── Favorites.jsx
│   │   └── NotFound.jsx
│   ├── utils/          # Utilitaires
│   │   └── supabase.js
│   ├── App.jsx         # Composant principal
│   ├── main.jsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── .env.example        # Variables d'environnement exemple
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎨 Personnalisation

### Couleurs
Modifiez les couleurs dans `tailwind.config.js` :

```js
colors: {
  primary: {
    DEFAULT: '#2563eb',
    light: '#dbeafe',
    dark: '#1e40af',
  },
  // ...
}
```

### Styles
Les classes utilitaires sont définies dans `src/index.css` :
- `.btn-primary` - Bouton principal
- `.btn-secondary` - Bouton secondaire
- `.btn-outline` - Bouton bordure
- `.input-field` - Champ de saisie
- `.card` - Carte de contenu
- `.page-container` - Conteneur de page

## 🔐 Authentification

L'application utilise Supabase Auth pour :
- Inscription avec email/mot de passe
- Connexion
- Gestion des sessions
- Récupération de mot de passe (à implémenter)

## 💳 Paiements

Le système de paiement avec FedaPay doit être configuré dans la page `Reservation.jsx`. 

Documentation FedaPay : https://fedapay.com/developers

## 📱 Application Mobile

Ce projet fait partie d'un écosystème comprenant également une application mobile React Native.
Les deux applications partagent le même backend Supabase.

## 🚀 Déploiement

### Netlify / Vercel

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

### Variables d'environnement en production
N'oubliez pas de configurer les variables d'environnement sur votre plateforme de déploiement.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- Développé pour Bus Bénin
- Application mobile et web

## 🆘 Support

Pour toute question ou problème :
- Email: contact@busbenin.com
- Issues GitHub

## 📝 TODO

- [ ] Intégration complète de FedaPay
- [ ] Page de récupération de mot de passe
- [ ] Système de notifications
- [ ] Chat avec le support
- [ ] Export PDF des billets
- [ ] Historique des paiements
- [ ] Statistiques utilisateur
- [ ] Multilangue (FR/EN)
