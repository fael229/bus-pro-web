# 🔍 Débogage - Compagnie non trouvée

## ❌ Problème
Message "Compagnie non trouvée" lors du clic sur le nom d'une compagnie.

## 🧪 Étape 1 : Vérifier la console (F12)

1. Allez sur une page de trajet `/trajet/:id`
2. Cliquez sur le nom de la compagnie
3. Ouvrez Developer Tools (F12)
4. Regardez la console

### Logs attendus

**Si tout fonctionne :**
```
🔍 Loading compagnie with ID: abc123-456-789...
✅ Compagnie loaded: {id: "...", nom: "...", ...}
```

**Si erreur RLS :**
```
❌ Error loading compagnie: {message: "..."}
❌ Error details: {...}
```

**Si ID invalide :**
```
🔍 Loading compagnie with ID: undefined
ou
🔍 Loading compagnie with ID: null
```

## 🔧 Solutions selon l'erreur

### Cas 1 : ID undefined ou null

**Problème :** La compagnie n'a pas d'ID dans le trajet

**Solution :**
```sql
-- Vérifier les trajets sans compagnie
SELECT id, depart, arrivee, compagnie_id 
FROM trajets 
WHERE compagnie_id IS NULL;

-- Assigner une compagnie à ces trajets
UPDATE trajets 
SET compagnie_id = (SELECT id FROM compagnies LIMIT 1)
WHERE compagnie_id IS NULL;
```

### Cas 2 : Erreur 406 (RLS)

**Problème :** Politiques RLS manquantes sur la table `compagnies`

**Solution :** Exécutez `fix_compagnies_rls.sql` dans Supabase SQL Editor

**Script rapide :**
```sql
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_compagnies"
ON compagnies FOR SELECT
USING (true);
```

### Cas 3 : Compagnie n'existe pas

**Problème :** L'ID de la compagnie n'existe pas dans la base

**Solution :**
```sql
-- Vérifier si la compagnie existe
SELECT id, nom FROM compagnies WHERE id = 'ID_ICI';

-- Lister toutes les compagnies
SELECT id, nom FROM compagnies;
```

## 📊 Requêtes de diagnostic

### 1. Vérifier les trajets et leurs compagnies

```sql
SELECT 
  t.id as trajet_id,
  t.depart || ' → ' || t.arrivee as trajet,
  t.compagnie_id,
  c.nom as compagnie_nom,
  CASE 
    WHEN c.id IS NULL THEN '❌ Pas de compagnie'
    ELSE '✅ OK'
  END as status
FROM trajets t
LEFT JOIN compagnies c ON t.compagnie_id = c.id
ORDER BY status, t.depart;
```

### 2. Vérifier les politiques RLS

```sql
-- Voir si RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'compagnies';

-- Voir les politiques existantes
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'compagnies';
```

### 3. Tester l'accès à une compagnie

```sql
-- En tant qu'utilisateur anonyme
SET ROLE anon;
SELECT * FROM compagnies LIMIT 1;
RESET ROLE;

-- En tant qu'utilisateur authentifié
SET ROLE authenticated;
SELECT * FROM compagnies LIMIT 1;
RESET ROLE;
```

## 🎯 Checklist de résolution

- [ ] Ouvrir la console (F12)
- [ ] Cliquer sur le nom d'une compagnie
- [ ] Vérifier les logs dans la console
- [ ] Vérifier que l'ID n'est pas undefined/null
- [ ] Vérifier que RLS est configuré sur `compagnies`
- [ ] Créer la politique de lecture publique
- [ ] Vérifier que les trajets ont un `compagnie_id` valide
- [ ] Actualiser la page et retester

## 🔧 Script de correction complet

Exécutez dans Supabase SQL Editor :

```sql
-- 1. Activer RLS
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;

-- 2. Politique de lecture publique
DROP POLICY IF EXISTS "public_select_compagnies" ON compagnies;
CREATE POLICY "public_select_compagnies"
ON compagnies FOR SELECT
TO authenticated, anon
USING (true);

-- 3. Vérifier que tous les trajets ont une compagnie
SELECT COUNT(*) as trajets_sans_compagnie
FROM trajets 
WHERE compagnie_id IS NULL;

-- 4. Si résultat > 0, créer une compagnie par défaut
DO $$
DECLARE
  v_compagnie_id uuid;
  v_count integer;
BEGIN
  -- Compter les trajets sans compagnie
  SELECT COUNT(*) INTO v_count FROM trajets WHERE compagnie_id IS NULL;
  
  IF v_count > 0 THEN
    -- Créer ou récupérer une compagnie par défaut
    INSERT INTO compagnies (nom, telephone, adresse)
    VALUES ('Transport Général', '+229 90 00 00 00', 'Bénin')
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO v_compagnie_id;
    
    -- Si pas d'ID retourné, prendre une compagnie existante
    IF v_compagnie_id IS NULL THEN
      SELECT id INTO v_compagnie_id FROM compagnies LIMIT 1;
    END IF;
    
    -- Assigner la compagnie aux trajets orphelins
    UPDATE trajets 
    SET compagnie_id = v_compagnie_id
    WHERE compagnie_id IS NULL;
    
    RAISE NOTICE '✅ % trajets mis à jour avec compagnie_id: %', v_count, v_compagnie_id;
  ELSE
    RAISE NOTICE '✅ Tous les trajets ont une compagnie';
  END IF;
END $$;

-- 5. Vérification finale
SELECT 
  COUNT(*) as total_compagnies,
  (SELECT COUNT(*) FROM trajets WHERE compagnie_id IS NOT NULL) as trajets_avec_compagnie,
  (SELECT COUNT(*) FROM trajets WHERE compagnie_id IS NULL) as trajets_sans_compagnie
FROM compagnies;
```

## 💡 Causes les plus probables

### 1. ❌ Politiques RLS manquantes (80%)
**Solution :** Exécuter `fix_compagnies_rls.sql`

### 2. ❌ Trajets sans compagnie_id (15%)
**Solution :** Assigner une compagnie aux trajets orphelins

### 3. ❌ ID de compagnie invalide (5%)
**Solution :** Vérifier l'intégrité des données

## 🎨 Test visuel

Après correction, sur la page de trajet vous devriez pouvoir :

1. **Voir le nom de la compagnie** (cliquable)
2. **Hover** → Texte devient bleu
3. **Clic** → Redirection vers `/compagnies/:id`
4. **Page de détail** s'affiche avec :
   - Logo de la compagnie
   - Nom, téléphone, adresse
   - Liste des trajets

## 📞 Besoin d'aide ?

Si le problème persiste, copiez les informations suivantes :

### Logs de la console (F12)
```
🔍 Loading compagnie with ID: ...
❌ Error: ...
```

### Résultat de ces requêtes SQL
```sql
-- Nombre de compagnies
SELECT COUNT(*) FROM compagnies;

-- Politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'compagnies';

-- Trajets sans compagnie
SELECT COUNT(*) FROM trajets WHERE compagnie_id IS NULL;
```

## ✅ Résultat attendu

Après corrections :

**Console (F12) :**
```
🔍 Loading compagnie with ID: abc123-456...
✅ Compagnie loaded: {
  id: "abc123-456...",
  nom: "Transport Express",
  telephone: "+229 97 00 00 01",
  adresse: "Cotonou, Bénin"
}
```

**Page affichée :**
```
┌────────────────────────────────────────┐
│  [LOGO]  Transport Express            │
│          📞 +229 97 00 00 01          │
│          📍 Cotonou, Bénin            │
│          🚌 5 trajets disponibles     │
├────────────────────────────────────────┤
│  Trajets proposés (5)                 │
│  [Liste des trajets...]               │
└────────────────────────────────────────┘
```
