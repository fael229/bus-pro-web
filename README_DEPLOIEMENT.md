# 🚀 Guide de déploiement sur Render

## 📋 Prérequis

- ✅ Compte GitHub (gratuit)
- ✅ Compte Render (gratuit) - [render.com](https://render.com)
- ✅ Compte Supabase (pour la base de données)
- ✅ Variables d'environnement Supabase et FedaPay

## 🎯 Étapes de déploiement

### 1. 📦 Préparer le projet (DÉJÀ FAIT ✅)

Les fichiers suivants ont été créés/configurés :
- ✅ `.gitignore` - Fichiers à exclure de Git
- ✅ `render.yaml` - Configuration Render
- ✅ `.env.example` - Template des variables d'environnement

### 2. 🔐 Créer un dépôt GitHub

#### Option A : Ligne de commande
```bash
cd c:\Users\FAEL\Desktop\bus_pro\web

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Bus Benin Web App"

# Créer le dépôt sur GitHub
# 1. Aller sur https://github.com/new
# 2. Nom du dépôt : bus-benin-web
# 3. Description : Application web de réservation de bus au Bénin
# 4. Public ou Private (votre choix)
# 5. NE PAS initialiser avec README
# 6. Cliquer "Create repository"

# Lier au dépôt distant (remplacer USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/USERNAME/bus-benin-web.git

# Pousser le code
git branch -M main
git push -u origin main
```

#### Option B : GitHub Desktop (plus simple)
1. Télécharger et installer [GitHub Desktop](https://desktop.github.com)
2. Ouvrir GitHub Desktop
3. Cliquer "File" → "Add Local Repository"
4. Sélectionner `c:\Users\FAEL\Desktop\bus_pro\web`
5. Cliquer "Publish repository"
6. Choisir le nom : `bus-benin-web`
7. Cliquer "Publish repository"

### 3. 🌐 Déployer sur Render

#### Étape 3.1 : Créer le projet sur Render

1. **Aller sur [render.com](https://render.com)**
2. **Se connecter** (ou créer un compte gratuit)
3. **Cliquer sur "New +"** → **"Static Site"**

#### Étape 3.2 : Connecter GitHub

1. **Autoriser Render** à accéder à vos dépôts GitHub
2. **Sélectionner** `bus-benin-web` dans la liste
3. **Cliquer "Connect"**

#### Étape 3.3 : Configuration du déploiement

Render devrait détecter automatiquement le fichier `render.yaml`. Sinon, remplir :

**Nom du site :**
```
bus-benin-web
```

**Branch :**
```
main
```

**Build Command :**
```bash
npm install && npm run build
```

**Publish Directory :**
```
dist
```

#### Étape 3.4 : Ajouter les variables d'environnement

Dans la section **"Environment"**, ajouter :

**VITE_SUPABASE_URL**
```
https://votre-projet.supabase.co
```
> 📍 Trouver dans Supabase : Settings → API → Project URL

**VITE_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
> 📍 Trouver dans Supabase : Settings → API → Project API keys → anon public

**VITE_FEDAPAY_PUBLIC_KEY**
```
pk_live_... ou pk_sandbox_...
```
> 📍 Trouver dans FedaPay Dashboard

#### Étape 3.5 : Lancer le déploiement

1. **Vérifier** que toutes les configurations sont correctes
2. **Cliquer "Create Static Site"**
3. **Attendre** le déploiement (2-5 minutes)

### 4. ✅ Vérifier le déploiement

Une fois le déploiement terminé :

1. **URL du site** : `https://bus-benin-web.onrender.com` (ou personnalisé)
2. **Tester** la navigation
3. **Vérifier** que les données Supabase se chargent
4. **Tester** une réservation

## 🔧 Configuration avancée

### Domaine personnalisé

1. Dans Render, aller dans **"Settings"** → **"Custom Domain"**
2. Ajouter votre domaine (ex: `www.busbenin.com`)
3. Configurer les DNS selon les instructions Render
4. Render fournit automatiquement un certificat SSL gratuit

### Optimisation des performances

Le `render.yaml` inclut déjà :
- ✅ **Routing SPA** : Toutes les routes redirigent vers index.html
- ✅ **Node 18** : Version stable et performante
- ✅ **Cache** : Les builds sont mis en cache

### Redeploiement automatique

**Chaque fois que vous poussez du code sur GitHub, Render redéploie automatiquement !**

```bash
# Faire des modifications
# ...

# Commiter et pousser
git add .
git commit -m "Ajout de nouvelles fonctionnalités"
git push origin main

# Render redéploie automatiquement ! 🎉
```

## 📊 Structure du projet déployé

```
https://bus-benin-web.onrender.com/
├── /                          → Page d'accueil
├── /trajets                   → Liste des trajets
├── /trajet/:id               → Détail d'un trajet
├── /compagnies               → Liste des compagnies
├── /compagnies/:id           → Détail d'une compagnie
├── /mes-reservations         → Réservations utilisateur
├── /profil                   → Profil utilisateur
├── /login                    → Connexion
├── /register                 → Inscription
└── /admin/*                  → Pages admin
    ├── /admin                → Dashboard
    ├── /admin/trajets        → Gestion trajets
    ├── /admin/reservations   → Gestion réservations
    └── /admin/compagnies     → Gestion compagnies
```

## 🚨 Résolution de problèmes

### Build échoue sur Render

**Erreur : "Module not found"**
```bash
# Solution : Vérifier que toutes les dépendances sont dans package.json
npm install
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push origin main
```

**Erreur : "Out of memory"**
```
# Le plan gratuit Render a des limites mémoire
# Solution : Optimiser le build dans vite.config.js
```

### Page blanche après déploiement

**Problème 1 : Variables d'environnement manquantes**
- Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont configurées
- Les variables doivent commencer par `VITE_` pour être accessibles dans le client

**Problème 2 : Erreur de routing**
- Vérifier que `render.yaml` a la règle de rewrite correcte
- Toutes les routes doivent rediriger vers `/index.html`

**Problème 3 : CORS Supabase**
1. Aller dans Supabase → Settings → API
2. Ajouter l'URL Render dans "Site URL"
3. Ajouter l'URL dans "Redirect URLs"

### Supabase ne se connecte pas

1. **Vérifier les variables d'environnement** dans Render
2. **Vérifier les RLS policies** dans Supabase
3. **Vérifier les logs** dans Render (Logs tab)

### Paiements FedaPay ne fonctionnent pas

1. **Vérifier** `VITE_FEDAPAY_PUBLIC_KEY` dans Render
2. **Mode sandbox** : Utiliser `pk_sandbox_...`
3. **Mode production** : Utiliser `pk_live_...`
4. **Vérifier** que le domaine Render est autorisé dans FedaPay

## 📝 Checklist de déploiement

Avant de déployer, vérifier :

- [ ] Toutes les dépendances sont dans `package.json`
- [ ] Le fichier `.env.example` existe avec les bonnes clés
- [ ] Le fichier `.gitignore` exclut `.env` et `node_modules`
- [ ] Le build local fonctionne : `npm run build`
- [ ] Le projet est sur GitHub
- [ ] Les credentials Supabase sont prêts
- [ ] Les credentials FedaPay sont prêts
- [ ] Les RLS policies Supabase sont configurées

Pendant le déploiement :

- [ ] Le dépôt GitHub est connecté à Render
- [ ] Les variables d'environnement sont configurées
- [ ] Le build réussit sans erreur
- [ ] Le site est accessible via l'URL Render

Après le déploiement :

- [ ] Le site charge correctement
- [ ] Les données Supabase s'affichent
- [ ] La connexion/inscription fonctionne
- [ ] Les réservations fonctionnent
- [ ] Les paiements FedaPay fonctionnent (mode test)
- [ ] L'admin dashboard fonctionne

## 🎉 Déploiement terminé !

Votre application est maintenant accessible publiquement sur :
```
https://bus-benin-web.onrender.com
```

### Prochaines étapes

1. **Tester** toutes les fonctionnalités
2. **Configurer** un domaine personnalisé (optionnel)
3. **Activer** FedaPay en mode production
4. **Monitorer** les performances et erreurs
5. **Partager** le lien avec vos utilisateurs !

## 📞 Support

**Render Documentation :**
- https://render.com/docs/static-sites

**Supabase Documentation :**
- https://supabase.com/docs

**Problèmes spécifiques au projet :**
- Vérifier les logs dans Render → Logs tab
- Vérifier la console navigateur (F12) pour les erreurs frontend

---

**🚀 Bon déploiement !**
