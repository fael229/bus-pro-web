# 🚀 Guide d'installation rapide - Bus Bénin Web

## Installation et lancement

### 1. Naviguer vers le dossier
```bash
cd c:\Users\FAEL\Desktop\bus_pro\web
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet web :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
VITE_FEDAPAY_PUBLIC_KEY=votre_cle_publique_fedapay
```

**Note**: Utilisez les mêmes identifiants Supabase que l'application mobile.

### 4. Lancer l'application
```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 🎯 Vérification de l'installation

Une fois l'application lancée, vous devriez voir :
- ✅ Page d'accueil avec le formulaire de recherche
- ✅ Navbar avec les liens Accueil/Trajets
- ✅ Destinations populaires
- ✅ Trajets populaires (si des trajets existent dans Supabase)

## 📋 Prochaines étapes

### Tests basiques
1. **Créer un compte** - Cliquer sur "S'inscrire"
2. **Se connecter** - Utiliser vos identifiants
3. **Rechercher un trajet** - Utiliser le formulaire de recherche
4. **Voir les détails** - Cliquer sur un trajet
5. **Ajouter aux favoris** - Cliquer sur le ❤️
6. **Faire une réservation** - Cliquer sur "Réserver"

### Configuration FedaPay (optionnel)
Pour activer les paiements en ligne :
1. Créer un compte sur https://fedapay.com
2. Récupérer votre clé publique
3. L'ajouter dans `.env`
4. Implémenter la logique de paiement dans `src/pages/Reservation.jsx`

## 🐛 Problèmes courants

### Erreur de connexion Supabase
- Vérifiez que les variables d'environnement sont correctes
- Assurez-vous que l'URL Supabase est bien accessible
- Vérifiez que la clé anon est valide

### Page blanche
- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs JavaScript
- Assurez-vous que toutes les dépendances sont installées

### Styles non appliqués
- Vérifiez que Tailwind est bien configuré
- Relancez le serveur de développement

## 📱 Compatibilité

L'application est testée sur :
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

## 🔗 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React Router](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

## ✨ Fonctionnalités implémentées

- ✅ Authentification (inscription, connexion, déconnexion)
- ✅ Recherche de trajets avec filtres
- ✅ Affichage des détails d'un trajet
- ✅ Système de favoris
- ✅ Système de réservation
- ✅ Gestion de profil
- ✅ Historique des réservations
- ✅ Mode sombre/clair
- ✅ Design responsive
- ✅ Navigation complète

## 🚀 Build pour production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

## 📞 Support

En cas de problème, consultez :
- Le fichier README.md principal
- La documentation Supabase
- Les logs de la console navigateur
