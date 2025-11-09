-- ══════════════════════════════════════════════════════════════════════
-- RLS POLICIES POUR LE SYSTÈME DE RÔLE COMPAGNIE
-- ══════════════════════════════════════════════════════════════════════
-- 
-- Ce fichier contient toutes les policies nécessaires pour que les
-- gestionnaires de compagnie puissent accéder uniquement à leurs données
--
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : TRAJETS
-- ══════════════════════════════════════════════════════════════════════

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Public can view trajets" ON trajets;
DROP POLICY IF EXISTS "Compagnies can view their trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can manage all trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can insert trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can update trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can delete trajets" ON trajets;

-- Activer RLS
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;

-- 1. Tout le monde peut voir tous les trajets (pour la recherche publique)
CREATE POLICY "Public can view trajets"
ON trajets FOR SELECT
TO authenticated, anon
USING (true);

-- 2. Les gestionnaires de compagnie peuvent voir leurs trajets
CREATE POLICY "Compagnies can view their trajets"
ON trajets FOR SELECT
TO authenticated
USING (
  compagnie_id IN (
    SELECT compagnie_id 
    FROM profiles 
    WHERE id = auth.uid() 
    AND compagnie_id IS NOT NULL
  )
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 3. Les admins peuvent insérer des trajets
CREATE POLICY "Admins can insert trajets"
ON trajets FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 4. Les admins peuvent mettre à jour des trajets
CREATE POLICY "Admins can update trajets"
ON trajets FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 5. Les admins peuvent supprimer des trajets
CREATE POLICY "Admins can delete trajets"
ON trajets FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : RESERVATIONS
-- ══════════════════════════════════════════════════════════════════════

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Users can view their reservations" ON reservations;
DROP POLICY IF EXISTS "Compagnies can view their reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Users can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their reservations" ON reservations;
DROP POLICY IF EXISTS "Compagnies can update their reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;

-- Activer RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 1. Les utilisateurs peuvent voir leurs propres réservations
CREATE POLICY "Users can view their reservations"
ON reservations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Les gestionnaires de compagnie peuvent voir les réservations de leurs trajets
CREATE POLICY "Compagnies can view their reservations"
ON reservations FOR SELECT
TO authenticated
USING (
  trajet_id IN (
    SELECT t.id 
    FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid() AND p.compagnie_id IS NOT NULL
  )
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 3. Les admins peuvent voir toutes les réservations
CREATE POLICY "Admins can view all reservations"
ON reservations FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 4. Les utilisateurs authentifiés peuvent créer des réservations
CREATE POLICY "Users can insert reservations"
ON reservations FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Les utilisateurs peuvent mettre à jour leurs propres réservations
CREATE POLICY "Users can update their reservations"
ON reservations FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Les gestionnaires de compagnie peuvent mettre à jour les réservations de leurs trajets
CREATE POLICY "Compagnies can update their reservations"
ON reservations FOR UPDATE
TO authenticated
USING (
  trajet_id IN (
    SELECT t.id 
    FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid() AND p.compagnie_id IS NOT NULL
  )
)
WITH CHECK (
  trajet_id IN (
    SELECT t.id 
    FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid() AND p.compagnie_id IS NOT NULL
  )
);

-- 7. Les admins peuvent mettre à jour toutes les réservations
CREATE POLICY "Admins can update all reservations"
ON reservations FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 8. Les admins peuvent supprimer des réservations
CREATE POLICY "Admins can delete reservations"
ON reservations FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : COMPAGNIES
-- ══════════════════════════════════════════════════════════════════════

-- Supprimer anciennes policies
DROP POLICY IF EXISTS "Public can view compagnies" ON compagnies;
DROP POLICY IF EXISTS "Admins can manage compagnies" ON compagnies;

-- Activer RLS
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;

-- 1. Tout le monde peut voir les compagnies
CREATE POLICY "Public can view compagnies"
ON compagnies FOR SELECT
TO authenticated, anon
USING (true);

-- 2. Les admins peuvent tout faire sur les compagnies
CREATE POLICY "Admins can manage compagnies"
ON compagnies FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ══════════════════════════════════════════════════════════════════════

-- Voir toutes les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('trajets', 'reservations', 'compagnies', 'profiles')
ORDER BY tablename, policyname;

-- ══════════════════════════════════════════════════════════════════════
-- RÉSUMÉ DES PERMISSIONS
-- ══════════════════════════════════════════════════════════════════════
--
-- ADMIN (admin = true)
-- ✓ Voir, créer, modifier, supprimer : profiles, trajets, réservations, compagnies
--
-- GESTIONNAIRE COMPAGNIE (compagnie_id != null)
-- ✓ Voir : trajets de sa compagnie
-- ✓ Voir : réservations des trajets de sa compagnie
-- ✓ Modifier : réservations des trajets de sa compagnie (statut)
-- ✗ Ne peut pas : créer/modifier/supprimer trajets
-- ✗ Ne peut pas : voir/modifier autres compagnies
--
-- UTILISATEUR NORMAL (admin = false, compagnie_id = null)
-- ✓ Voir : tous les trajets (recherche publique)
-- ✓ Voir : toutes les compagnies (recherche publique)
-- ✓ Créer : réservations
-- ✓ Voir : ses propres réservations
-- ✓ Modifier : ses propres réservations
-- ✗ Ne peut pas : voir réservations des autres
--
-- PUBLIC (anon)
-- ✓ Voir : trajets
-- ✓ Voir : compagnies
-- ✗ Ne peut pas : réservations, profiles
--
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS DE DÉPLOIEMENT
-- ══════════════════════════════════════════════════════════════════════
--
-- 1. Aller dans Supabase Dashboard
-- 2. Cliquer sur "SQL Editor"
-- 3. Créer une nouvelle query
-- 4. Copier-coller TOUT le contenu de ce fichier
-- 5. Exécuter (Run)
-- 6. Vérifier qu'il n'y a pas d'erreurs
-- 7. Tester l'assignation de compagnie dans /admin/users
--
-- ══════════════════════════════════════════════════════════════════════
