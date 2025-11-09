# ❌ Erreur Écran Blanc - Résolution

## Problème identifié

L'écran blanc était causé par :
1. ❌ Fichier `.env` manquant
2. ❌ Variables d'environnement non configurées
3. ❌ Erreur JavaScript bloquante dans `supabase.js`

## ✅ Solutions appliquées

### 1. Fichier .env créé

Un fichier `.env` a été créé avec des valeurs par défaut :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FEDAPAY_PUBLIC_KEY=pk_sandbox_your_key
VITE_FEDAPAY_MODE=sandbox
```

### 2. Code Supabase sécurisé

Le fichier `src/utils/supabase.js` a été modifié pour :
- ⚠️ Afficher un warning au lieu d'une erreur bloquante
- ✅ Créer un client placeholder si les clés sont manquantes
- ✅ Permettre à l'application de démarrer même sans configuration

## 🚀 Prochaines étapes

### Étape 1 : Obtenir vos clés Supabase

1. Allez sur https://supabase.com
2. Connectez-vous ou créez un compte
3. Créez un nouveau projet ou ouvrez un projet existant
4. Allez dans **Settings** → **API**
5. Copiez :
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

### Étape 2 : Configurer le fichier .env

Éditez le fichier `c:\Users\FAEL\Desktop\bus_pro\web\.env` :

```env
# Remplacez par vos vraies valeurs
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# FedaPay (optionnel pour le moment)
VITE_FEDAPAY_PUBLIC_KEY=pk_sandbox_votre_cle
VITE_FEDAPAY_MODE=sandbox
```

### Étape 3 : Redémarrer le serveur

**IMPORTANT** : Après avoir modifié le `.env`, vous **DEVEZ** redémarrer le serveur de développement :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

## 🔍 Vérification

Après configuration, vous devriez voir :

### ✅ Console du navigateur
- Pas d'erreur Supabase
- Pas d'erreur de variable d'environnement

### ✅ Page d'accueil
- Formulaire de recherche visible
- Sections destinations/trajets (vides si pas de données)
- Navbar fonctionnelle

### ✅ Fonctionnalités
- Navigation entre les pages
- Authentification (si configurée)
- Affichage des données (si la DB est configurée)

## 🗄️ Configuration de la base de données

Si vous n'avez pas encore créé les tables Supabase :

### Option 1 : Utiliser le projet mobile existant
Si vous avez déjà configuré le backend pour l'app mobile :
```env
# Utilisez les MÊMES clés que l'app mobile
VITE_SUPABASE_URL=https://votre-projet-existant.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_existante
```

### Option 2 : Créer un nouveau projet
Exécutez ce SQL dans Supabase SQL Editor :

```sql
-- Table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table compagnies
CREATE TABLE compagnies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  logo_url TEXT,
  telephone TEXT,
  adresse TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table trajets
CREATE TABLE trajets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  depart TEXT NOT NULL,
  arrivee TEXT NOT NULL,
  prix NUMERIC NOT NULL,
  horaires TEXT[],
  gare TEXT,
  compagnie_id UUID REFERENCES compagnies(id),
  note NUMERIC,
  nb_avis INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table destinations
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ville TEXT NOT NULL UNIQUE,
  image_url TEXT,
  nb_trajets INTEGER DEFAULT 0
);

-- Table reservations
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  trajet_id UUID REFERENCES trajets(id),
  nb_places INTEGER NOT NULL,
  horaire TEXT NOT NULL,
  nom_passager TEXT NOT NULL,
  telephone_passager TEXT NOT NULL,
  email_passager TEXT,
  montant_total NUMERIC NOT NULL,
  statut TEXT CHECK (statut IN ('en_attente', 'confirmee', 'annulee', 'expiree')) DEFAULT 'en_attente',
  statut_paiement TEXT CHECK (statut_paiement IN ('pending', 'approved', 'declined', 'canceled')) DEFAULT 'pending',
  fedapay_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table favoris
CREATE TABLE favoris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  trajet_id UUID REFERENCES trajets(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trajet_id)
);

-- Table avis
CREATE TABLE avis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trajet_id UUID REFERENCES trajets(id),
  user_id UUID REFERENCES profiles(id),
  note INTEGER CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- Politiques basiques
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🐛 Autres problèmes possibles

### Erreur "Cannot read properties of null"
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Supprimez node_modules et réinstallez : `rm -rf node_modules && npm install`

### Erreur de compilation
- Vérifiez qu'il n'y a pas d'erreurs de syntaxe dans les fichiers
- Consultez la console du terminal où `npm run dev` est lancé

### Page blanche persistante
1. Ouvrez la console du navigateur (F12)
2. Regardez l'onglet Console pour les erreurs
3. Vérifiez l'onglet Network pour les requêtes échouées

## 📞 Support

Si le problème persiste :
1. Vérifiez la console navigateur (F12)
2. Vérifiez la console terminal
3. Assurez-vous que le fichier .env est bien à la racine du dossier web
4. Redémarrez complètement le serveur

## ✅ Checklist de vérification

- [ ] Fichier `.env` existe à la racine de `web/`
- [ ] Variables Supabase configurées avec de vraies valeurs
- [ ] Serveur redémarré après modification du `.env`
- [ ] Pas d'erreur dans la console navigateur
- [ ] Pas d'erreur dans la console terminal
- [ ] Page d'accueil s'affiche correctement
