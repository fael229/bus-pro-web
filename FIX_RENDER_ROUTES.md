# 🔧 Fix : Routes SPA sur Render (page blanche en accès direct)

## 🐛 Problème

### Symptômes
- ✅ Navigation interne fonctionne (clic sur liens)
- ❌ Accès direct par URL affiche page blanche
- ❌ Refresh (F5) sur une route affiche page blanche

### Exemple en production
```
❌ https://votre-app.onrender.com/compagnie/trajets
   → Page blanche

✅ https://votre-app.onrender.com → puis clic sur "Trajets"
   → Fonctionne
```

---

## 🔍 Cause

### Problème de Render avec sites statiques
Render ne supporte pas bien les **rewrites** pour les sites statiques. La configuration `routes` dans `render.yaml` est ignorée ou mal appliquée.

**Configuration qui ne fonctionne PAS :**
```yaml
services:
  - type: web
    runtime: static  # ← Problème ici
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## ✅ Solution : Serveur Express

Au lieu d'un site statique, on utilise un **serveur Node.js** avec Express qui :
1. Sert les fichiers statiques du dossier `dist/`
2. Redirige toutes les routes vers `index.html` (fallback SPA)

---

## 📂 Fichiers créés/modifiés

### 1. `server.js` (NOUVEAU)
```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback pour toutes les routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Rôle :**
- Serveur Express qui gère le fallback SPA
- Syntaxe ES6 (import/export) compatible avec `"type": "module"`

---

### 2. `render.yaml` (MODIFIÉ)

**Avant :**
```yaml
services:
  - type: web
    runtime: static
    staticPublishPath: ./dist
```

**Après :**
```yaml
services:
  - type: web
    runtime: node
    buildCommand: npm ci && npm run build
    startCommand: node server.js
    envVars:
      - key: NODE_VERSION
        value: 18
```

**Changements :**
- `runtime: static` → `runtime: node`
- Ajout de `startCommand: node server.js`
- Plus besoin de `staticPublishPath` et `routes`

---

### 3. `package.json` (MODIFIÉ)

**Ajouts :**
```json
{
  "scripts": {
    "start": "node server.js"  // ← Nouveau
  },
  "dependencies": {
    "express": "^4.18.2"  // ← Nouveau
  }
}
```

---

## 🚀 Déploiement

### Étape 1 : Commit et push
```bash
git add .
git commit -m "Fix: Routes SPA sur Render avec serveur Express"
git push origin main
```

### Étape 2 : Render redéploie automatiquement
Render détectera les changements et :
1. Exécutera `npm ci && npm run build` (build)
2. Exécutera `node server.js` (start)

### Étape 3 : Vérifier le déploiement
Attendez quelques minutes, puis testez :
```
✅ https://votre-app.onrender.com/compagnie/trajets
✅ https://votre-app.onrender.com/admin/users
✅ Refresh (F5) sur n'importe quelle route
```

---

## 🧪 Tester localement

### Tester le serveur de production
```bash
# Build
npm run build

# Démarrer le serveur Express
npm start
```

Puis accédez à `http://localhost:3000/compagnie/trajets`
→ ✅ Devrait fonctionner

---

## 🔄 Différence avec mode dev

| Mode | Commande | Serveur | Routes SPA |
|------|----------|---------|------------|
| **Dev** | `npm run dev` | Vite | ✅ Géré par Vite |
| **Production** | `npm start` | Express | ✅ Géré par Express |

---

## 📊 Architecture

```
┌─────────────────────────────────────┐
│         Render (Production)         │
├─────────────────────────────────────┤
│                                     │
│  1. Build: npm ci && npm run build  │
│     → Génère dossier dist/          │
│                                     │
│  2. Start: node server.js           │
│     → Express démarre               │
│     → Écoute sur PORT               │
│                                     │
│  3. Requêtes HTTP                   │
│     GET /assets/app.js              │
│     → Express sert fichier          │
│                                     │
│     GET /compagnie/trajets          │
│     → Express → index.html          │
│     → React Router prend le relais  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔍 Vérification

### Logs Render
Dans le dashboard Render, vérifiez les logs :
```
Build:
✓ npm ci && npm run build
✓ vite build
✓ dist/ created

Deploy:
✓ node server.js
✓ Server running on port 3000
```

### Test des routes
Testez ces URLs en accès direct (copier-coller dans la barre d'adresse) :

**Routes publiques :**
- `https://votre-app.onrender.com/`
- `https://votre-app.onrender.com/trajets`
- `https://votre-app.onrender.com/compagnies`

**Routes protégées :**
- `https://votre-app.onrender.com/profile`
- `https://votre-app.onrender.com/compagnie/trajets`
- `https://votre-app.onrender.com/admin`

**Toutes devraient fonctionner !** ✅

---

## ⚠️ Notes importantes

### 1. Port
Express écoute sur `process.env.PORT || 3000`. Render définit automatiquement `PORT`.

### 2. Type module
Le `package.json` utilise `"type": "module"`, donc :
- ✅ `import/export` (syntaxe ES6)
- ❌ `require/module.exports` (CommonJS)

### 3. Performance
Express ajoute une légère surcharge par rapport à un site statique pur, mais :
- Négligeable pour votre cas d'usage
- Meilleure compatibilité SPA
- Plus de contrôle sur le serveur

---

## 🛠️ Troubleshooting

### Erreur : "Cannot find module 'express'"
**Cause :** Express pas installé

**Solution :**
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

---

### Erreur : "404 Not Found" persiste
**Cause :** Render n'a pas redéployé avec la nouvelle config

**Solution :**
1. Dashboard Render → Manual Deploy
2. Ou forcer un nouveau commit :
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

### Erreur : "Server not starting"
**Cause :** `dist/` vide ou non généré

**Solution :** Vérifier que `npm run build` s'exécute correctement
```bash
npm run build
# Vérifier que dist/ contient index.html
```

---

## ✅ Checklist de déploiement

```
✅ server.js créé
✅ render.yaml modifié (runtime: node)
✅ package.json modifié (express + script start)
✅ npm install exécuté
✅ Testé localement avec npm start
✅ git add . && git commit
✅ git push origin main
✅ Render redéploie (attendre 2-3 min)
✅ Tester les routes en production
```

---

## 🎉 Résultat final

Après le déploiement :
- ✅ Accès direct par URL fonctionne
- ✅ Refresh (F5) fonctionne sur toutes les pages
- ✅ Navigation interne fonctionne toujours
- ✅ Pas de page blanche
- ✅ Application totalement fonctionnelle

---

## 📅 Changelog

**Date** : 10 novembre 2025, 12:30
**Problème** : Page blanche en accès direct sur Render
**Solution** : Serveur Express avec fallback SPA
**Impact** : Routes fonctionnent en production

---

## 📚 Ressources

- [Render Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [React Router SPA](https://reactrouter.com/en/main/start/overview)

---

**Status** : ✅ PRÊT À DÉPLOYER
