-- ══════════════════════════════════════════════════════════════════════
-- FIX : Accès public aux données pour la page d'accueil
-- ══════════════════════════════════════════════════════════════════════
-- Ce script permet l'accès public (anon + authenticated) aux données
-- nécessaires pour afficher la page d'accueil
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : DESTINATIONS
-- ══════════════════════════════════════════════════════════════════════

-- Nettoyer
DROP POLICY IF EXISTS "Public read access to destinations" ON destinations;
DROP POLICY IF EXISTS "Everyone can view destinations" ON destinations;

-- Activer RLS
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir les destinations
CREATE POLICY "Everyone can view destinations"
ON destinations FOR SELECT
TO authenticated, anon
USING (true);

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : TRAJETS
-- ══════════════════════════════════════════════════════════════════════

-- Nettoyer
DROP POLICY IF EXISTS "Public can view trajets" ON trajets;
DROP POLICY IF EXISTS "Everyone can view trajets" ON trajets;
DROP POLICY IF EXISTS "Compagnies can view their trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can insert trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can update trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can delete trajets" ON trajets;

-- Activer RLS
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir les trajets (pour recherche publique)
CREATE POLICY "Everyone can view trajets"
ON trajets FOR SELECT
TO authenticated, anon
USING (true);

-- Policy : Admins peuvent tout faire sur trajets
CREATE POLICY "Admins can manage trajets"
ON trajets FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : COMPAGNIES
-- ══════════════════════════════════════════════════════════════════════

-- Nettoyer
DROP POLICY IF EXISTS "Public can view compagnies" ON compagnies;
DROP POLICY IF EXISTS "Everyone can view compagnies" ON compagnies;
DROP POLICY IF EXISTS "Admins can manage compagnies" ON compagnies;

-- Activer RLS
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir les compagnies
CREATE POLICY "Everyone can view compagnies"
ON compagnies FOR SELECT
TO authenticated, anon
USING (true);

-- Policy : Admins peuvent tout faire sur compagnies
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
-- TABLE : RESERVATIONS
-- ══════════════════════════════════════════════════════════════════════

-- Nettoyer
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

-- Policy : Users voient leurs réservations
CREATE POLICY "Users can view their reservations"
ON reservations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy : Compagnies voient réservations de leurs trajets
CREATE POLICY "Compagnies can view their reservations"
ON reservations FOR SELECT
TO authenticated
USING (
  trajet_id IN (
    SELECT t.id FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid() AND p.compagnie_id IS NOT NULL
  )
);

-- Policy : Admins voient tout
CREATE POLICY "Admins can view all reservations"
ON reservations FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- Policy : Authenticated users peuvent créer réservations
CREATE POLICY "Users can insert reservations"
ON reservations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy : Users peuvent modifier leurs réservations
CREATE POLICY "Users can update their reservations"
ON reservations FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy : Compagnies peuvent modifier réservations de leurs trajets
CREATE POLICY "Compagnies can update their reservations"
ON reservations FOR UPDATE
TO authenticated
USING (
  trajet_id IN (
    SELECT t.id FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid() AND p.compagnie_id IS NOT NULL
  )
)
WITH CHECK (
  trajet_id IN (
    SELECT t.id FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid() AND p.compagnie_id IS NOT NULL
  )
);

-- Policy : Admins peuvent tout faire
CREATE POLICY "Admins can manage reservations"
ON reservations FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : FAVORIS
-- ══════════════════════════════════════════════════════════════════════

-- Nettoyer
DROP POLICY IF EXISTS "Users can manage their favoris" ON favoris;

-- Activer RLS
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;

-- Policy : Users gèrent leurs favoris
CREATE POLICY "Users can manage their favoris"
ON favoris FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════
-- TABLE : AVIS
-- ══════════════════════════════════════════════════════════════════════

-- Nettoyer
DROP POLICY IF EXISTS "Everyone can view avis" ON avis;
DROP POLICY IF EXISTS "Users can create avis" ON avis;
DROP POLICY IF EXISTS "Users can update their avis" ON avis;

-- Activer RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir les avis
CREATE POLICY "Everyone can view avis"
ON avis FOR SELECT
TO authenticated, anon
USING (true);

-- Policy : Users peuvent créer avis
CREATE POLICY "Users can create avis"
ON avis FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy : Users peuvent modifier leurs avis
CREATE POLICY "Users can update their avis"
ON avis FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ══════════════════════════════════════════════════════════════════════

-- Voir toutes les policies créées
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Tester l'accès aux données
SELECT COUNT(*) as "Destinations" FROM destinations;
SELECT COUNT(*) as "Trajets" FROM trajets;
SELECT COUNT(*) as "Compagnies" FROM compagnies;

-- ══════════════════════════════════════════════════════════════════════
-- RÉSUMÉ DES PERMISSIONS
-- ══════════════════════════════════════════════════════════════════════
--
-- ANON (non connecté) :
-- ✓ Voir : destinations, trajets, compagnies, avis
--
-- AUTHENTICATED (connecté) :
-- ✓ Voir : destinations, trajets, compagnies, avis, ses réservations
-- ✓ Créer : réservations, avis, favoris
-- ✓ Modifier : ses réservations, ses avis, ses favoris
--
-- GESTIONNAIRE COMPAGNIE (compagnie_id != null) :
-- ✓ Voir : réservations de ses trajets
-- ✓ Modifier : réservations de ses trajets (statut)
--
-- ADMIN (admin = true) :
-- ✓ Tout faire sur toutes les tables
--
-- ══════════════════════════════════════════════════════════════════════
