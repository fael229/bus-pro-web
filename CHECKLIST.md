# ✅ Checklist de déploiement

## 📦 Avant de commencer

- [ ] J'ai un compte GitHub (gratuit) - [Créer](https://github.com/signup)
- [ ] J'ai un compte Render (gratuit) - [Créer](https://render.com/signup)
- [ ] J'ai mes credentials Supabase
  - [ ] Project URL
  - [ ] Anon Key
- [ ] J'ai ma clé FedaPay (mode sandbox pour tester)

## 🔄 Étape 1 : Pousser sur GitHub

### Option A : GitHub Desktop (Recommandé)
- [ ] Télécharger GitHub Desktop depuis https://desktop.github.com
- [ ] Installer et se connecter avec mon compte GitHub
- [ ] Ouvrir GitHub Desktop
- [ ] Cliquer : File → Add Local Repository
- [ ] Naviguer vers : `c:\Users\FAEL\Desktop\bus_pro\web`
- [ ] Si demandé, cliquer "Create a repository"
- [ ] Cliquer "Publish repository"
- [ ] Nom du dépôt : `bus-benin-web`
- [ ] Choisir : Public ou Private
- [ ] Cliquer "Publish repository"
- [ ] ✅ Vérifier sur GitHub que le dépôt existe

### Option B : Ligne de commande
- [ ] Ouvrir PowerShell dans `c:\Users\FAEL\Desktop\bus_pro\web`
- [ ] Exécuter : `git init`
- [ ] Exécuter : `git add .`
- [ ] Exécuter : `git commit -m "Initial commit - Bus Benin Web App"`
- [ ] Créer un dépôt sur https://github.com/new
  - [ ] Nom : `bus-benin-web`
  - [ ] Cliquer "Create repository"
- [ ] Exécuter : `git remote add origin https://github.com/USERNAME/bus-benin-web.git`
  - [ ] (Remplacer USERNAME par votre nom d'utilisateur)
- [ ] Exécuter : `git branch -M main`
- [ ] Exécuter : `git push -u origin main`
- [ ] ✅ Vérifier sur GitHub que le code est bien poussé

## 🌐 Étape 2 : Déployer sur Render

- [ ] Aller sur https://render.com
- [ ] Se connecter (ou créer un compte)
- [ ] Cliquer sur "New +"
- [ ] Sélectionner "Static Site"
- [ ] Cliquer "Connect GitHub"
- [ ] Autoriser Render à accéder à mes dépôts GitHub
- [ ] Dans la liste, trouver et sélectionner `bus-benin-web`
- [ ] Cliquer "Connect"
- [ ] ✅ Vérifier que Render a détecté `render.yaml`
- [ ] Cliquer sur "Advanced" pour ajouter les variables d'environnement

## 🔐 Étape 3 : Variables d'environnement

### VITE_SUPABASE_URL
- [ ] Aller sur Supabase → Settings → API
- [ ] Copier "Project URL"
- [ ] Dans Render, ajouter une variable :
  - Nom : `VITE_SUPABASE_URL`
  - Valeur : [Coller l'URL]

### VITE_SUPABASE_ANON_KEY
- [ ] Sur la même page Supabase
- [ ] Copier "anon public" key
- [ ] Dans Render, ajouter une variable :
  - Nom : `VITE_SUPABASE_ANON_KEY`
  - Valeur : [Coller la clé]

### VITE_FEDAPAY_PUBLIC_KEY
- [ ] Aller sur FedaPay Dashboard
- [ ] Copier la clé publique (pk_sandbox_xxx pour tester)
- [ ] Dans Render, ajouter une variable :
  - Nom : `VITE_FEDAPAY_PUBLIC_KEY`
  - Valeur : [Coller la clé]

## 🚀 Étape 4 : Lancer le déploiement

- [ ] Vérifier que les 3 variables sont bien configurées
- [ ] Cliquer "Create Static Site"
- [ ] Attendre que le build se termine (2-5 minutes)
- [ ] ✅ Vérifier qu'il n'y a pas d'erreurs dans les logs

## ✅ Étape 5 : Vérification

- [ ] Ouvrir l'URL fournie par Render (https://bus-benin-web.onrender.com)
- [ ] Vérifier que la page d'accueil charge
- [ ] Vérifier que la liste des trajets s'affiche
- [ ] Tester la connexion/inscription
- [ ] Tester une recherche de trajet
- [ ] Tester la création d'une réservation
- [ ] Vérifier que le dashboard admin fonctionne (si admin)
- [ ] Vérifier que les graphiques s'affichent
- [ ] ✅ Site fonctionnel !

## 🔧 Étape 6 : Configuration Supabase (Important)

- [ ] Aller dans Supabase → Settings → API
- [ ] Dans "Site URL", ajouter l'URL Render : `https://bus-benin-web.onrender.com`
- [ ] Dans "Redirect URLs", ajouter :
  - `https://bus-benin-web.onrender.com/`
  - `https://bus-benin-web.onrender.com/**`
- [ ] Sauvegarder
- [ ] ✅ Connexion/Authentification devrait maintenant fonctionner

## 🎉 Terminé !

- [ ] Site accessible publiquement
- [ ] Toutes les fonctionnalités testées
- [ ] URL partagée avec les utilisateurs

## 📝 Notes

**URL du site** : `https://bus-benin-web.onrender.com`

**Mises à jour futures** :
Chaque fois que je pousse du code sur GitHub, Render redéploie automatiquement !

```bash
# Faire des modifications
git add .
git commit -m "Description des changements"
git push origin main
# → Render redéploie automatiquement ! 🎉
```

## 🚨 En cas de problème

- [ ] Vérifier les logs dans Render Dashboard → Logs
- [ ] Vérifier la console du navigateur (F12)
- [ ] Consulter `README_DEPLOIEMENT.md` pour plus de détails
- [ ] Consulter `DEPLOIEMENT_RAPIDE.md` pour un guide simplifié

## 📞 Ressources

- **Guide complet** : `README_DEPLOIEMENT.md`
- **Commandes Git** : `COMMANDES_GIT.md`
- **Guide rapide** : `DEPLOIEMENT_RAPIDE.md`
- **Récapitulatif** : `RECAP_DEPLOIEMENT.txt`
