# 🔍 Débogage - Avis ne s'affichent pas

## ❌ Problème
Aucun avis n'apparaît sur la page de détail du trajet.

## ✅ Solutions appliquées

### 1. **Logs détaillés ajoutés**
La console (F12) affiche maintenant :
- 🔍 Loading avis for trajet: [id]
- ✅ Avis loaded: X
- ❌ Erreurs détaillées si problème

### 2. **Requête simplifiée**
**Avant :**
```javascript
.select('*, profiles:user_id(username, avatar_url)')
```
❌ Problème : La jointure avec `profiles` peut causer des erreurs RLS

**Après :**
```javascript
.select('*')
```
✅ Solution : Requête simple sans jointure

### 3. **Affichage anonyme**
Les avis affichent maintenant "Voyageur" au lieu du nom d'utilisateur.

## 🧪 Comment tester

### Étape 1 : Vérifier dans la console (F12)

1. Allez sur une page de trajet `/trajet/:id`
2. Ouvrez Developer Tools (F12)
3. Regardez la console

**Logs attendus :**
```
🔍 Loading avis for trajet: abc123...
✅ Avis loaded: 2
📊 Sample avis: {id: "...", note: 5, commentaire: "...", ...}
```

**Si erreur RLS :**
```
❌ Error loading avis: {message: "..."}
❌ Error details: {...}
```

### Étape 2 : Vérifier qu'il y a des avis dans la DB

Dans Supabase SQL Editor :

```sql
-- Vérifier s'il y a des avis
SELECT COUNT(*) FROM avis;
```

Si résultat = 0 → **Aucun avis existe**, créez-en un (voir section suivante).

### Étape 3 : Créer des avis de test

#### A. Via SQL (Supabase)

```sql
-- 1. Trouver un trajet
SELECT id, depart, arrivee FROM trajets LIMIT 1;

-- 2. Créer un avis (remplacez les valeurs)
INSERT INTO avis (user_id, trajet_id, note, commentaire)
VALUES (
  auth.uid(),                    -- Votre ID utilisateur
  'TRAJET_ID_ICI',              -- ID du trajet
  5,                            -- Note (1-5)
  'Excellent trajet, très confortable et ponctuel !'
);

-- 3. Créer plusieurs avis
INSERT INTO avis (user_id, trajet_id, note, commentaire)
VALUES 
  (auth.uid(), 'TRAJET_ID', 5, 'Super service !'),
  (auth.uid(), 'TRAJET_ID', 4, 'Très bien dans l''ensemble'),
  (auth.uid(), 'TRAJET_ID', 3, 'Correct mais peut mieux faire');
```

#### B. Via l'application

1. Connectez-vous
2. Allez sur `/trajet/:id`
3. Cliquez sur "Laisser un avis"
4. Remplissez le formulaire
5. Cliquez sur "Publier l'avis"

### Étape 4 : Vérifier les politiques RLS

```sql
-- Voir les politiques sur la table avis
SELECT * FROM pg_policies WHERE tablename = 'avis';
```

#### Créer les politiques si manquantes

```sql
-- Activer RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut VOIR les avis
CREATE POLICY "public_select_avis"
ON avis
FOR SELECT
USING (true);

-- Les utilisateurs connectés peuvent CRÉER des avis
CREATE POLICY "users_insert_avis"
ON avis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

## 🔧 Politiques RLS complètes

Exécutez dans Supabase SQL Editor :

```sql
-- =====================================================
-- POLITIQUES RLS POUR LA TABLE AVIS
-- =====================================================

-- Activer RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- 1. LECTURE PUBLIQUE - Tout le monde peut voir les avis
DROP POLICY IF EXISTS "public_select_avis" ON avis;
CREATE POLICY "public_select_avis"
ON avis
FOR SELECT
TO authenticated, anon
USING (true);

-- 2. CRÉATION - Les utilisateurs connectés peuvent créer des avis
DROP POLICY IF EXISTS "users_insert_avis" ON avis;
CREATE POLICY "users_insert_avis"
ON avis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. MODIFICATION - Les utilisateurs peuvent modifier leurs propres avis
DROP POLICY IF EXISTS "users_update_own_avis" ON avis;
CREATE POLICY "users_update_own_avis"
ON avis
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. SUPPRESSION - Les utilisateurs peuvent supprimer leurs propres avis
DROP POLICY IF EXISTS "users_delete_own_avis" ON avis;
CREATE POLICY "users_delete_own_avis"
ON avis
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. ADMIN - Les admins peuvent tout faire
DROP POLICY IF EXISTS "admins_all_on_avis" ON avis;
CREATE POLICY "admins_all_on_avis"
ON avis
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);
```

## 📊 Requêtes de vérification

### Compter les avis par trajet

```sql
SELECT 
  t.id,
  t.depart,
  t.arrivee,
  COUNT(a.id) as nb_avis,
  AVG(a.note) as note_moyenne
FROM trajets t
LEFT JOIN avis a ON t.id = a.trajet_id
GROUP BY t.id, t.depart, t.arrivee
ORDER BY nb_avis DESC;
```

### Voir tous les avis

```sql
SELECT 
  a.id,
  a.note,
  a.commentaire,
  a.created_at,
  t.depart || ' → ' || t.arrivee as trajet,
  a.user_id
FROM avis a
JOIN trajets t ON a.trajet_id = t.id
ORDER BY a.created_at DESC;
```

### Voir les avis d'un trajet spécifique

```sql
SELECT 
  note,
  commentaire,
  created_at,
  user_id
FROM avis
WHERE trajet_id = 'TRAJET_ID_ICI'
ORDER BY created_at DESC;
```

## 🎯 Checklist de résolution

- [ ] Ouvrir la console (F12) et vérifier les logs
- [ ] Vérifier qu'il y a des avis dans la DB (`SELECT COUNT(*) FROM avis`)
- [ ] Vérifier les politiques RLS (`SELECT * FROM pg_policies WHERE tablename = 'avis'`)
- [ ] Créer les politiques RLS si manquantes
- [ ] Créer des avis de test via SQL ou l'app
- [ ] Actualiser la page du trajet
- [ ] Vérifier que les avis s'affichent

## 💡 Causes probables

### 1. ❌ Aucun avis dans la base
**Solution :** Créer des avis de test

### 2. ❌ Politiques RLS manquantes
**Solution :** Exécuter le script SQL ci-dessus

### 3. ❌ RLS désactivé
**Solution :**
```sql
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
```

### 4. ❌ Erreur de jointure avec profiles
**Solution :** ✅ Corrigé (jointure retirée)

## 🧪 Script de test complet

Copiez-collez dans Supabase SQL Editor :

```sql
-- 1. Activer RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- 2. Créer la politique de lecture publique
DROP POLICY IF EXISTS "public_select_avis" ON avis;
CREATE POLICY "public_select_avis"
ON avis FOR SELECT
USING (true);

-- 3. Créer la politique d'insertion
DROP POLICY IF EXISTS "users_insert_avis" ON avis;
CREATE POLICY "users_insert_avis"
ON avis FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Créer des avis de test
DO $$
DECLARE
  v_trajet_id uuid;
BEGIN
  -- Récupérer un trajet
  SELECT id INTO v_trajet_id FROM trajets LIMIT 1;
  
  IF v_trajet_id IS NOT NULL THEN
    -- Créer 3 avis de test
    INSERT INTO avis (user_id, trajet_id, note, commentaire)
    VALUES 
      (auth.uid(), v_trajet_id, 5, 'Excellent trajet ! Très ponctuel et confortable.'),
      (auth.uid(), v_trajet_id, 4, 'Bon service, je recommande.'),
      (auth.uid(), v_trajet_id, 5, 'Parfait, rien à redire !');
    
    RAISE NOTICE 'Avis créés avec succès pour le trajet %', v_trajet_id;
  ELSE
    RAISE NOTICE 'Aucun trajet trouvé. Créez d''abord un trajet.';
  END IF;
END $$;

-- 5. Vérifier les avis créés
SELECT 
  a.note,
  a.commentaire,
  t.depart || ' → ' || t.arrivee as trajet
FROM avis a
JOIN trajets t ON a.trajet_id = t.id
ORDER BY a.created_at DESC;
```

## 📞 Besoin d'aide ?

Si les avis ne s'affichent toujours pas :

1. **Copiez les logs de la console** (F12)
2. **Vérifiez le résultat** de `SELECT COUNT(*) FROM avis`
3. **Vérifiez les politiques** avec `SELECT * FROM pg_policies WHERE tablename = 'avis'`

Le problème vient probablement de :
- ❌ Aucun avis dans la DB → Créez-en
- ❌ Politiques RLS manquantes → Exécutez le script
- ❌ RLS désactivé → Activez-le

## ✅ Résultat attendu

Après corrections, sur la page `/trajet/:id` vous devriez voir :

```
┌────────────────────────────────────────┐
│ Avis des voyageurs (3) [Laisser un avis]│
├────────────────────────────────────────┤
│ 👤 Voyageur              ⭐⭐⭐⭐⭐ 5/5│
│ Excellent trajet ! Très ponctuel...    │
│ 12 novembre 2025                       │
├────────────────────────────────────────┤
│ 👤 Voyageur              ⭐⭐⭐⭐ 4/5  │
│ Bon service, je recommande.            │
│ 11 novembre 2025                       │
└────────────────────────────────────────┘
```

**Console (F12) :**
```
🔍 Loading avis for trajet: abc123...
✅ Avis loaded: 3
📊 Sample avis: {id: "...", note: 5, commentaire: "Excellent...", ...}
```
