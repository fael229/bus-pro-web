# 📝 Commandes Git pour le déploiement

## 🎯 Guide rapide - Pousser sur GitHub

### 🔰 Première fois (Initialisation)

```bash
# 1. Ouvrir le terminal dans le dossier du projet
cd c:\Users\FAEL\Desktop\bus_pro\web

# 2. Initialiser Git (si pas déjà fait)
git init

# 3. Vérifier les fichiers qui seront ajoutés
git status

# 4. Ajouter tous les fichiers
git add .

# 5. Faire le premier commit
git commit -m "Initial commit - Application Bus Benin"

# 6. Créer le dépôt sur GitHub
# Aller sur https://github.com/new
# Nom : bus-benin-web
# Cliquer "Create repository" (NE PAS initialiser avec README)

# 7. Lier au dépôt GitHub (remplacer USERNAME par votre nom GitHub)
git remote add origin https://github.com/USERNAME/bus-benin-web.git

# 8. Renommer la branche en main
git branch -M main

# 9. Pousser le code
git push -u origin main
```

### ✅ Configuration de Git (si pas encore fait)

```bash
# Configurer votre nom
git config --global user.name "Votre Nom"

# Configurer votre email GitHub
git config --global user.email "votre-email@example.com"
```

### 🔄 Mises à jour après modifications

**À chaque fois que vous faites des changements :**

```bash
# 1. Voir les fichiers modifiés
git status

# 2. Ajouter les fichiers modifiés
git add .

# 3. Faire un commit avec un message descriptif
git commit -m "Description des changements"

# 4. Pousser sur GitHub
git push origin main
```

### 📦 Exemples de commits

```bash
# Après ajout d'une fonctionnalité
git add .
git commit -m "Ajout du système de graphiques dans l'admin"
git push origin main

# Après correction de bug
git add .
git commit -m "Fix: Correction du filtre de date dans AdminReservations"
git push origin main

# Après amélioration UI
git add .
git commit -m "Amélioration de l'interface utilisateur du dashboard"
git push origin main
```

### 🔍 Commandes utiles

```bash
# Voir l'historique des commits
git log --oneline

# Voir les différences avant commit
git diff

# Annuler les modifications non commitées
git checkout .

# Voir les fichiers ignorés par Git
cat .gitignore

# Vérifier le dépôt distant
git remote -v
```

### 🚨 Résolution de problèmes

#### Erreur : "Repository not found"
```bash
# Vérifier l'URL du dépôt
git remote -v

# Si l'URL est incorrecte, la modifier (remplacer USERNAME)
git remote set-url origin https://github.com/USERNAME/bus-benin-web.git
```

#### Erreur : "Please tell me who you are"
```bash
# Configurer votre identité
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

#### Erreur : "Updates were rejected"
```bash
# Récupérer les changements distants d'abord
git pull origin main --rebase

# Puis pousser
git push origin main
```

### 🔐 Authentification GitHub

**Depuis 2021, GitHub ne supporte plus les mots de passe dans la ligne de commande.**

#### Option 1 : GitHub CLI (Recommandé)
```bash
# Installer GitHub CLI
# Windows : https://cli.github.com/

# Se connecter
gh auth login

# Pousser normalement
git push origin main
```

#### Option 2 : Personal Access Token
1. Aller sur GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Cliquer "Generate new token (classic)"
3. Donner un nom : "Bus Benin Web"
4. Cocher : `repo` (toutes les permissions repo)
5. Cliquer "Generate token"
6. **COPIER LE TOKEN** (vous ne le reverrez pas !)
7. Utiliser le token comme mot de passe lors du push

```bash
# Username : votre username GitHub
# Password : coller le token
git push origin main
```

#### Option 3 : GitHub Desktop (Le plus simple)
1. Télécharger [GitHub Desktop](https://desktop.github.com)
2. Se connecter avec votre compte GitHub
3. Ajouter le dépôt local
4. Cliquer "Publish repository"
5. ✅ Terminé !

### 📊 Workflow complet

```bash
# Jour 1 : Initialisation
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/bus-benin-web.git
git push -u origin main

# Jour 2 : Ajout de fonctionnalités
# ... faire des modifications ...
git add .
git commit -m "Ajout des graphiques dans le dashboard admin"
git push origin main

# Jour 3 : Corrections
# ... corriger des bugs ...
git add .
git commit -m "Fix: Correction du problème de compagnie non trouvée"
git push origin main

# Jour 4 : Déploiement
# Render détecte automatiquement les changements et redéploie !
```

### 🎯 Bonnes pratiques

1. **Commits fréquents** : Commiter souvent avec des messages clairs
   ```bash
   git commit -m "Ajout de X"
   git commit -m "Fix: Correction de Y"
   git commit -m "Amélioration de Z"
   ```

2. **Messages descriptifs** : Expliquer ce qui a été fait
   ```bash
   ✅ BIEN : "Ajout du filtre de date dans AdminReservations"
   ❌ MAL  : "Update"
   ```

3. **Vérifier avant** : Toujours vérifier ce qui va être commité
   ```bash
   git status
   git diff
   git add .
   git commit -m "..."
   ```

4. **Ne pas commiter** :
   - `.env` (secrets)
   - `node_modules` (trop gros)
   - `dist` (généré par le build)
   - Fichiers temporaires

5. **Branches** (optionnel pour petit projet) :
   ```bash
   # Créer une branche pour une nouvelle fonctionnalité
   git checkout -b feature/graphiques
   
   # Faire des modifications
   git add .
   git commit -m "Ajout des graphiques"
   
   # Fusionner dans main
   git checkout main
   git merge feature/graphiques
   
   # Pousser
   git push origin main
   ```

### 📈 Après le push

**Render redéploie automatiquement !**

1. GitHub reçoit votre push
2. Render détecte le changement
3. Render lance automatiquement un nouveau build
4. Votre site est mis à jour en 2-5 minutes

**Vous pouvez suivre le déploiement sur :**
- Render Dashboard → Votre projet → Deployments

---

## 🚀 Résumé - 5 commandes essentielles

```bash
# 1. Ajouter les fichiers
git add .

# 2. Commiter
git commit -m "Description des changements"

# 3. Pousser
git push origin main

# 4. Vérifier le statut
git status

# 5. Voir l'historique
git log --oneline
```

**C'est tout ! 🎉**
