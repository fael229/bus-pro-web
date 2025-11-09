# 🔧 Fix : Routes SPA - "Not Found" sur accès direct URL

## 🐛 Problème

### Symptômes
- ✅ Navigation interne fonctionne (clic sur liens)
- ❌ Accès direct par URL affiche "Not Found"

### Exemples
```
✅ Fonctionne : Clic sur lien /compagnie/trajets
❌ Ne fonctionne pas : Taper directement http://localhost:3000/compagnie/trajets
```

---

## 🔍 Cause

### Application SPA (Single Page Application)
React Router gère les routes côté client. Quand vous tapez une URL directement :

1. Le navigateur demande au serveur : `GET /compagnie/trajets`
2. Le serveur cherche un fichier physique `/compagnie/trajets/index.html`
3. ❌ Ce fichier n'existe pas → "Not Found"

### Ce qu'il faut
Le serveur doit **toujours** retourner `/index.html`, peu importe l'URL demandée. React Router prendra ensuite le relais pour afficher la bonne page.

---

## ✅ Solutions appliquées

### 1. Render.com (Déploiement production)
**Fichier** : `render.yaml`

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

✅ **Déjà configuré !** Fonctionnera en production sur Render.

---

### 2. Netlify (Alternative)
**Fichier** : `public/_redirects`

```
/* /index.html 200
```

✅ **Créé !** Sera copié dans `dist/` lors du build.

---

### 3. Vercel (Alternative)
**Fichier** : `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

✅ **Créé !** Prêt si vous utilisez Vercel.

---

### 4. Développement local (Vite)
**Fichier** : `vite.config.js`

✅ **Mis à jour !** Le mode dev (`npm run dev`) gère déjà les routes automatiquement.

---

## 🧪 Tester localement

### Méthode 1 : Mode développement (Recommandé)
```bash
npm run dev
```

Puis accédez à `http://localhost:3000/compagnie/trajets`
→ ✅ **Fonctionne** (Vite gère le fallback)

---

### Méthode 2 : Mode production local

#### Build
```bash
npm run build
```

#### Preview avec Vite
```bash
npm run preview
```

Puis accédez à `http://localhost:4173/compagnie/trajets`
→ ✅ **Devrait fonctionner**

---

### Méthode 3 : Serveur statique avec fallback

Si vous testez avec un autre serveur local, utilisez `serve` avec l'option `-s` :

```bash
# Installer serve (une seule fois)
npm install -g serve

# Lancer avec fallback SPA
cd dist
serve -s .
```

Puis accédez à `http://localhost:3000/compagnie/trajets`
→ ✅ **Fonctionne** (serve gère le fallback avec `-s`)

---

## 🚀 Déploiement

### Sur Render.com
1. **Push vers GitHub**
   ```bash
   git add .
   git commit -m "Fix: SPA routes configuration"
   git push origin main
   ```

2. **Render redéploie automatiquement**
3. **Testez les URLs directes**
   - `https://votre-app.onrender.com/compagnie/trajets` ✅
   - `https://votre-app.onrender.com/admin` ✅

---

### Sur Netlify
1. Déployez normalement
2. Le fichier `_redirects` sera automatiquement utilisé
3. ✅ Les routes fonctionneront

---

### Sur Vercel
1. Déployez normalement
2. Le fichier `vercel.json` sera automatiquement utilisé
3. ✅ Les routes fonctionneront

---

## 🎯 Vérification

### Checklist de test
```
□ npm run dev → Accès direct URL fonctionne
□ npm run build + npm run preview → Accès direct URL fonctionne
□ Déployé sur Render → Accès direct URL fonctionne
□ Navigation interne fonctionne toujours
□ Refresh page (F5) fonctionne sur toutes les routes
```

---

## 📋 Routes à tester

### Routes publiques
- `/` (Home)
- `/trajets`
- `/compagnies`
- `/login`
- `/register`

### Routes utilisateur
- `/profile`
- `/reservations`
- `/favorites`

### Routes gestionnaire compagnie
- `/compagnie`
- `/compagnie/trajets`
- `/compagnie/reservations`

### Routes admin
- `/admin`
- `/admin/reservations`
- `/admin/users`

---

## 🔧 Si ça ne fonctionne toujours pas

### En développement
1. Arrêter le serveur (`Ctrl+C`)
2. Supprimer `node_modules/.vite`
3. Relancer `npm run dev`

### En production
1. Vérifier que les fichiers ont été déployés :
   - `_redirects` dans le dossier dist (Netlify)
   - `render.yaml` à la racine (Render)
   - `vercel.json` à la racine (Vercel)

2. Vérifier les logs de déploiement

3. Forcer un nouveau déploiement :
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

---

## ✅ Résultat

Tous les fichiers de configuration sont en place pour que les **routes SPA fonctionnent correctement** en développement et en production, sur tous les hébergeurs.

**Statut** : ✅ Configuré
**Date** : 9 novembre 2025, 17:42

---

## 📚 Ressources

- [Vite SPA Fallback](https://vitejs.dev/guide/backend-integration.html)
- [Render Rewrites](https://render.com/docs/deploy-create-react-app#using-client-side-routing)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)
- [Vercel Rewrites](https://vercel.com/docs/concepts/projects/project-configuration#rewrites)
