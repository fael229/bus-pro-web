# 🔧 FIX : Impossible d'assigner une compagnie à un utilisateur

## 🔍 Problème identifié

Lorsque vous essayez d'assigner une compagnie à un utilisateur dans `/admin/users`, le champ `compagnie_id` reste `null` après la mise à jour.

**Objet utilisateur affiché :**
```javascript
{
  id: "e4d2dd55-e174-4b72-ae94-adfc616c27ab",
  username: "d85aff5e-0575-49b6-a783-9e5440cdd5df",
  email: "krang229@gmail.com",
  compagnie_id: null,  // ❌ Reste null
  admin: false,
  // ...
}
```

## 🎯 Cause du problème

**Les RLS (Row Level Security) policies de Supabase bloquent la mise à jour du champ `compagnie_id`.**

Même si vous êtes admin, sans les bonnes policies, Supabase refuse silencieusement la modification.

## ✅ Solution

### Étape 1 : Vérifier les logs dans la console

1. Ouvrez la **Console du navigateur** (F12)
2. Essayez d'assigner une compagnie
3. Vous devriez voir des logs détaillés :

```
🔄 Updating compagnie: { userId: "...", compagnieId: "..." }
📝 Update value: "e4d2dd55-..."
❌ Supabase error: { ... }  // ← Si erreur RLS
✅ Update result: [...]      // ← Si succès
```

### Étape 2 : Configurer les RLS Policies dans Supabase

**🚨 C'EST L'ÉTAPE LA PLUS IMPORTANTE 🚨**

#### A. Aller dans Supabase Dashboard

1. Connectez-vous sur [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Cliquez sur **"SQL Editor"** dans le menu de gauche
4. Cliquez sur **"New query"**

#### B. Exécuter le script RLS_POLICIES_PROFILES.sql

1. Ouvrez le fichier `RLS_POLICIES_PROFILES.sql`
2. Copiez **TOUT** le contenu
3. Collez dans l'éditeur SQL Supabase
4. Cliquez sur **"Run"** (en bas à droite)
5. Vérifiez qu'il n'y a **pas d'erreurs**

**Ce script va :**
- ✅ Supprimer les anciennes policies
- ✅ Créer 6 nouvelles policies
- ✅ Permettre aux admins de modifier tous les profils (y compris `compagnie_id`)

#### C. Exécuter le script RLS_POLICIES_COMPAGNIE.sql

1. Ouvrez le fichier `RLS_POLICIES_COMPAGNIE.sql`
2. Copiez **TOUT** le contenu
3. Créez une nouvelle query dans Supabase
4. Collez et cliquez sur **"Run"**

**Ce script va :**
- ✅ Configurer les permissions pour trajets
- ✅ Configurer les permissions pour réservations
- ✅ Permettre aux gestionnaires de compagnie d'accéder à leurs données

### Étape 3 : Vérifier les policies

Dans Supabase SQL Editor, exécutez :

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Vous devriez voir :**
```
tablename | policyname                          | cmd
----------|-------------------------------------|--------
profiles  | Admins can delete profiles          | DELETE
profiles  | Admins can update all profiles      | UPDATE  ← Important !
profiles  | Admins can view all profiles        | SELECT
profiles  | Enable insert for authenticated...  | INSERT
profiles  | Users can update their own profile  | UPDATE
profiles  | Users can view their own profile    | SELECT
```

### Étape 4 : Tester l'assignation

1. Retournez sur votre application
2. Rechargez la page `/admin/users` (F5)
3. Essayez d'assigner une compagnie à un utilisateur
4. Vérifiez dans la console :

**✅ Si ça marche :**
```
🔄 Updating compagnie: { userId: "...", compagnieId: "..." }
📝 Update value: "abc123..."
✅ Update result: [{
  id: "...",
  compagnie_id: "abc123...",  // ✅ Mise à jour !
  ...
}]
```

5. L'alerte "Compagnie mise à jour avec succès" s'affiche
6. Le badge passe de "Utilisateur" à "Compagnie"
7. L'ID de la compagnie s'affiche sous le badge

## 🔍 Debugging avancé

### Vérifier les permissions de votre admin

Dans Supabase SQL Editor :

```sql
-- Vérifier que votre compte est bien admin
SELECT id, email, admin, compagnie_id
FROM profiles
WHERE id = auth.uid();
```

**Résultat attendu :**
```
id                  | email              | admin | compagnie_id
--------------------|-------------------|-------|-------------
votre-id-uuid       | admin@example.com | true  | null
```

### Tester la mise à jour manuellement

Dans Supabase SQL Editor :

```sql
-- Remplacer les valeurs par les vôtres
UPDATE profiles
SET compagnie_id = 'ID_DE_VOTRE_COMPAGNIE'
WHERE id = 'ID_DE_UTILISATEUR_A_MODIFIER';

-- Vérifier
SELECT id, email, compagnie_id
FROM profiles
WHERE id = 'ID_DE_UTILISATEUR_A_MODIFIER';
```

### Vérifier les logs Supabase

1. Dans Supabase Dashboard
2. Allez dans **"Logs"** → **"Postgres Logs"**
3. Regardez les erreurs récentes
4. Cherchez des messages comme :
   - `"new row violates row-level security policy"`
   - `"permission denied"`

## 📋 Checklist de résolution

- [ ] J'ai exécuté `RLS_POLICIES_PROFILES.sql` dans Supabase
- [ ] J'ai exécuté `RLS_POLICIES_COMPAGNIE.sql` dans Supabase
- [ ] J'ai vérifié que les 6 policies existent sur `profiles`
- [ ] J'ai vérifié que je suis bien admin (`admin = true`)
- [ ] J'ai rechargé la page `/admin/users`
- [ ] J'ai testé l'assignation d'une compagnie
- [ ] J'ai vérifié les logs dans la console (F12)
- [ ] Le badge "Compagnie" s'affiche correctement
- [ ] L'utilisateur peut accéder à `/compagnie`

## 🎯 Si ça ne fonctionne toujours pas

### Option 1 : Désactiver temporairement RLS

**⚠️ NE PAS FAIRE EN PRODUCTION ⚠️**

```sql
-- Désactiver RLS sur profiles (TEMPORAIRE POUR DEBUG)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Tester l'assignation

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

Si ça fonctionne avec RLS désactivé, c'est confirmé que le problème vient des policies.

### Option 2 : Vérifier la structure de la table

```sql
-- Vérifier que le champ compagnie_id existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'compagnie_id';
```

**Résultat attendu :**
```
column_name  | data_type | is_nullable
-------------|-----------|------------
compagnie_id | uuid      | YES
```

### Option 3 : Créer une policy ultra-permissive (debug)

```sql
-- Policy temporaire pour debug
CREATE POLICY "Allow everything for admins (DEBUG)"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);
```

Testez, puis supprimez cette policy et utilisez les scripts fournis.

## 📚 Fichiers de solution

1. **`RLS_POLICIES_PROFILES.sql`** - Policies pour la table profiles
2. **`RLS_POLICIES_COMPAGNIE.sql`** - Policies complètes pour le système compagnie
3. **`Users.jsx`** (modifié) - Avec logs de debug améliorés

## ✅ Résumé

**Le problème :** RLS policies manquantes ou incorrectes

**La solution :** Exécuter les 2 scripts SQL dans Supabase

**Temps de fix :** 2-5 minutes

**Prérequis :** Accès admin à Supabase Dashboard

---

🔧 **Après avoir exécuté les scripts SQL, le problème devrait être résolu !**

Si vous rencontrez toujours des problèmes, vérifiez les logs dans la console et dans Supabase.
