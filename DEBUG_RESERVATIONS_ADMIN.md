# 🔍 Débogage - Réservations Admin

## ❌ Problème
Les pages admin (`Dashboard.jsx` et `AdminReservations.jsx`) n'affichent aucune réservation.

## ✅ Solutions appliquées

### 1. **Ajout de logs détaillés**
Les deux pages affichent maintenant des logs dans la console (F12) :
- 🔍 Loading reservations...
- ✅ Reservations loaded: X
- ❌ Error loading reservations: {...}

### 2. **Correction des requêtes Supabase**
**Avant :**
```javascript
.select('*, trajets(...), profiles:user_id(...)')
```

**Après :**
```javascript
.select(`
  *,
  trajets(
    depart,
    arrivee,
    compagnies:compagnie_id(nom)
  )
`)
```

La jointure avec `profiles` a été **retirée** car elle peut causer des erreurs de permissions RLS.

### 3. **Affichage des infos passager**
Maintenant on utilise directement les champs de la réservation :
- `reservation.nom_passager`
- `reservation.telephone_passager`
- `reservation.email_passager`

Au lieu de chercher dans `profiles`.

## 🧪 Comment tester

### Étape 1 : Ouvrir la console (F12)

1. Aller sur `/admin/dashboard` ou `/admin/reservations`
2. Ouvrir les Developer Tools (F12)
3. Aller dans l'onglet **Console**

### Étape 2 : Vérifier les logs

**Si tout fonctionne :**
```
📊 Loading dashboard stats...
🔍 Loading all reservations...
✅ Reservations loaded: 5
📊 First reservation: {id: "...", nom_passager: "...", ...}
```

**Si erreur RLS :**
```
❌ Error loading reservations: {message: "..."}
❌ Error details: {
  message: "Permission denied",
  code: "42501",
  ...
}
```

### Étape 3 : Vérifier dans Supabase

#### A. Vérifier qu'il y a des réservations

Dans Supabase SQL Editor :
```sql
SELECT COUNT(*) FROM reservations;
```

Si résultat = 0, **il n'y a aucune réservation** → Créez-en une via l'app.

#### B. Vérifier les politiques RLS

```sql
-- Voir les politiques sur la table reservations
SELECT * FROM pg_policies WHERE tablename = 'reservations';
```

#### C. Créer la politique admin si manquante

```sql
-- Politique pour que les admins voient TOUTES les réservations
CREATE POLICY "Les admins peuvent tout voir sur reservations"
ON reservations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);
```

#### D. Vérifier que votre compte est admin

```sql
-- Vérifier votre profil
SELECT id, email, admin FROM profiles 
WHERE id = auth.uid();
```

Si `admin` = `false` ou `NULL`, mettez-le à `true` :

```sql
-- Rendre votre compte admin
UPDATE profiles 
SET admin = true 
WHERE id = auth.uid();
```

### Étape 4 : Créer une réservation de test

Si aucune réservation n'existe :

1. Allez sur la page d'accueil
2. Cherchez un trajet
3. Faites une réservation
4. Retournez dans l'admin

Ou via SQL :

```sql
-- Créer une réservation de test
INSERT INTO reservations (
  user_id,
  trajet_id,
  nb_places,
  horaire,
  montant_total,
  nom_passager,
  telephone_passager,
  email_passager,
  statut,
  statut_paiement
)
SELECT 
  auth.uid(),
  (SELECT id FROM trajets LIMIT 1),
  2,
  '08:00',
  10000,
  'Test Passager',
  '+22997000001',
  'test@example.com',
  'en_attente',
  'pending'
WHERE EXISTS (SELECT 1 FROM trajets LIMIT 1);
```

## 🔧 Politiques RLS recommandées

### Pour la table `reservations`

```sql
-- 1. Les utilisateurs voient LEURS réservations
CREATE POLICY "users_select_own_reservations"
ON reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Les admins voient TOUTES les réservations
CREATE POLICY "admins_select_all_reservations"
ON reservations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- 3. Les admins peuvent modifier toutes les réservations
CREATE POLICY "admins_update_all_reservations"
ON reservations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- 4. Les utilisateurs peuvent créer leurs réservations
CREATE POLICY "users_insert_own_reservations"
ON reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

### Pour la table `trajets`

```sql
-- Tout le monde peut voir les trajets
CREATE POLICY "public_select_trajets"
ON trajets
FOR SELECT
TO authenticated
USING (true);

-- Les admins peuvent tout faire
CREATE POLICY "admins_all_on_trajets"
ON trajets
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

### Pour la table `compagnies`

```sql
-- Tout le monde peut voir les compagnies
CREATE POLICY "public_select_compagnies"
ON compagnies
FOR SELECT
TO authenticated
USING (true);

-- Les admins peuvent tout faire
CREATE POLICY "admins_all_on_compagnies"
ON compagnies
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

## 📊 Vérifications supplémentaires

### 1. Vérifier que RLS est activé

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('reservations', 'trajets', 'compagnies', 'profiles');
```

Si `rowsecurity` = `false`, activer RLS :

```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Tester la requête directement

Dans Supabase SQL Editor :

```sql
-- Voir toutes les réservations avec les trajets
SELECT 
  r.*,
  t.depart,
  t.arrivee,
  c.nom as compagnie_nom
FROM reservations r
LEFT JOIN trajets t ON r.trajet_id = t.id
LEFT JOIN compagnies c ON t.compagnie_id = c.id
ORDER BY r.created_at DESC
LIMIT 5;
```

### 3. Vérifier les données de test

```sql
-- Résumé des données
SELECT 
  'Utilisateurs' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Réservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'Trajets', COUNT(*) FROM trajets
UNION ALL
SELECT 'Compagnies', COUNT(*) FROM compagnies;
```

## 🎯 Checklist de résolution

- [ ] Ouvrir la console (F12) et vérifier les logs
- [ ] Vérifier qu'il y a des réservations dans la DB
- [ ] Vérifier que votre compte est admin
- [ ] Vérifier les politiques RLS
- [ ] Créer les politiques admin si manquantes
- [ ] Tester en créant une nouvelle réservation
- [ ] Actualiser les pages admin

## 💡 Astuces

### Désactiver temporairement RLS pour tester

⚠️ **UNIQUEMENT EN DÉVELOPPEMENT** :

```sql
-- DANGER : Désactiver RLS (temporaire)
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE trajets DISABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies DISABLE ROW LEVEL SECURITY;
```

Si les réservations apparaissent après ça → Le problème vient des politiques RLS.

**N'oubliez pas de réactiver RLS :**

```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;
```

### Logs console détaillés

Les pages affichent maintenant :
- Nombre de réservations chargées
- Premier élément (pour voir la structure)
- Détails des erreurs (message, code, hint)

## 📞 Besoin d'aide ?

Si le problème persiste après ces vérifications :

1. **Copiez les logs de la console** (F12)
2. **Vérifiez le résultat des requêtes SQL** ci-dessus
3. **Vérifiez que votre compte est admin** dans Supabase

Le problème vient probablement de :
- ❌ Aucune réservation dans la DB
- ❌ Compte non admin
- ❌ Politiques RLS manquantes ou incorrectes
- ❌ RLS désactivé

## ✅ Résultat attendu

Après corrections, vous devriez voir :

### Dashboard Admin
- Nombre total de réservations
- Réservations en attente / confirmées / annulées
- Tableau des 5 dernières réservations

### Gestion des réservations
- Liste complète de toutes les réservations
- Filtres par statut et recherche
- Boutons pour confirmer/annuler

Avec les infos :
- Nom du passager ✅
- Téléphone ✅
- Trajet (départ → arrivée) ✅
- Montant ✅
- Statut et paiement ✅
