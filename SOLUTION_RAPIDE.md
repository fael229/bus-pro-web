# 🚨 SOLUTION RAPIDE : Plus aucune donnée ne s'affiche

## 🎯 Solution en 3 étapes (2 minutes)

### Étape 1 : Diagnostiquer le problème

1. Ouvrir **Supabase SQL Editor**
2. Copier-coller **TOUT** le fichier `DIAGNOSTIC_RLS.sql`
3. Cliquer sur **"Run"**
4. Regarder les résultats :

**Si la requête 2 montre :**
```
admin: false  ← Vous n'êtes pas admin !
```
→ **Passez à l'étape 2**

**Si la requête 6 retourne "permission denied" :**
```
Error: new row violates row-level security policy
```
→ **Passez à l'étape 3**

---

### Étape 2 : Se promouvoir admin

1. Dans Supabase SQL Editor
2. Copier ces 3 lignes :

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
UPDATE profiles SET admin = true WHERE email = 'VOTRE_EMAIL@EXAMPLE.COM';
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

3. **MODIFIER** `VOTRE_EMAIL@EXAMPLE.COM` avec votre vrai email
4. Exécuter
5. **Passez à l'étape 3**

---

### Étape 3 : Corriger les RLS Policies

1. Copier **TOUT** le fichier `FIX_RLS_POLICIES.sql`
2. Coller dans Supabase SQL Editor
3. Cliquer sur **"Run"**
4. Attendre "Success"
5. **Retourner sur votre application**

---

### Étape 4 : Tester

1. Aller sur `/admin/users`
2. Recharger la page (F5)
3. **Les utilisateurs devraient s'afficher** ✅

---

## 🔍 Si ça ne fonctionne toujours pas

### Option A : Désactiver complètement RLS (temporaire)

Dans Supabase SQL Editor :

```sql
-- Désactiver RLS sur toutes les tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trajets DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies DISABLE ROW LEVEL SECURITY;
```

Testez maintenant. Si ça fonctionne, le problème vient bien des policies.

### Option B : Vérifier les logs

1. Dans votre application, ouvrez la **Console** (F12)
2. Regardez les erreurs :

```
❌ Error loading users: {...}
```

3. Copiez l'erreur complète et cherchez :
   - `"permission denied"`
   - `"row-level security policy"`
   - `"insufficient_privilege"`

### Option C : Vérifier dans Supabase Dashboard

1. Allez dans **"Table Editor"**
2. Cliquez sur **"profiles"**
3. Voyez-vous des données ? 
   - **OUI** → Le problème vient de l'application
   - **NON** → Le problème vient de Supabase/RLS

---

## 📋 Checklist de résolution

```
□ Exécuté DIAGNOSTIC_RLS.sql
□ Vérifié que je suis admin (admin = true)
□ Si non admin, exécuté CREER_ADMIN.sql
□ Exécuté FIX_RLS_POLICIES.sql
□ Rechargé /admin/users (F5)
□ Ouvert la console (F12) pour voir les erreurs
□ Les utilisateurs s'affichent maintenant
```

---

## 🎯 Ce qui s'est passé

Le script `RLS_POLICIES_PROFILES.sql` a créé des **policies trop restrictives** ou **en conflit**, bloquant l'accès même pour les admins.

**Policies problématiques :**
- Plusieurs policies SELECT qui se chevauchent
- Logique de vérification admin trop complexe
- Conditions USING et WITH CHECK incorrectes

**Solution :**
- Policy unique et simple pour les admins
- Policy permissive pour la lecture
- Logique simplifiée

---

## 🚀 Après la correction

Une fois que tout fonctionne :

1. ✅ Les utilisateurs s'affichent sur `/admin/users`
2. ✅ Vous pouvez assigner des compagnies
3. ✅ Le badge "Compagnie" s'affiche
4. ✅ Les gestionnaires peuvent accéder à `/compagnie`

---

## 📞 Si rien ne fonctionne

**Option nucléaire** (en dernier recours) :

```sql
-- Supprimer TOUTES les policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Désactiver RLS partout
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trajets DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies DISABLE ROW LEVEL SECURITY;
```

⚠️ **Attention** : Cette option désactive toute sécurité ! À utiliser UNIQUEMENT en développement local.

Ensuite, recréez les policies proprement avec `FIX_RLS_POLICIES.sql`.

---

## 📚 Fichiers de solution

1. **`DIAGNOSTIC_RLS.sql`** ← Commencer par ici
2. **`CREER_ADMIN.sql`** ← Si vous n'êtes pas admin
3. **`FIX_RLS_POLICIES.sql`** ← La vraie solution
4. **`SOLUTION_RAPIDE.md`** ← Ce fichier

---

🔧 **Dans 99% des cas, exécuter FIX_RLS_POLICIES.sql résout le problème !**
