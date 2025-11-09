-- =====================================================
-- POLITIQUES RLS POUR BUS BENIN
-- =====================================================
-- Ce fichier contient toutes les politiques de sécurité
-- pour que les pages admin fonctionnent correctement
-- =====================================================

-- 1. Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLITIQUES POUR LA TABLE PROFILES
-- =====================================================

-- Les utilisateurs peuvent voir leur propre profil
DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
CREATE POLICY "users_select_own_profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Les admins peuvent voir tous les profils
DROP POLICY IF EXISTS "admins_select_all_profiles" ON profiles;
CREATE POLICY "admins_select_all_profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- Les admins peuvent modifier tous les profils
DROP POLICY IF EXISTS "admins_update_all_profiles" ON profiles;
CREATE POLICY "admins_update_all_profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- =====================================================
-- POLITIQUES POUR LA TABLE RESERVATIONS
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres réservations
DROP POLICY IF EXISTS "users_select_own_reservations" ON reservations;
CREATE POLICY "users_select_own_reservations"
ON reservations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les admins peuvent voir TOUTES les réservations
DROP POLICY IF EXISTS "admins_select_all_reservations" ON reservations;
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

-- Les utilisateurs peuvent créer leurs propres réservations
DROP POLICY IF EXISTS "users_insert_own_reservations" ON reservations;
CREATE POLICY "users_insert_own_reservations"
ON reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres réservations
DROP POLICY IF EXISTS "users_update_own_reservations" ON reservations;
CREATE POLICY "users_update_own_reservations"
ON reservations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Les admins peuvent modifier TOUTES les réservations
DROP POLICY IF EXISTS "admins_update_all_reservations" ON reservations;
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

-- Les admins peuvent supprimer des réservations
DROP POLICY IF EXISTS "admins_delete_reservations" ON reservations;
CREATE POLICY "admins_delete_reservations"
ON reservations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- =====================================================
-- POLITIQUES POUR LA TABLE TRAJETS
-- =====================================================

-- Tout le monde (connecté) peut voir les trajets
DROP POLICY IF EXISTS "authenticated_select_trajets" ON trajets;
CREATE POLICY "authenticated_select_trajets"
ON trajets
FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs anonymes peuvent aussi voir les trajets
DROP POLICY IF EXISTS "anon_select_trajets" ON trajets;
CREATE POLICY "anon_select_trajets"
ON trajets
FOR SELECT
TO anon
USING (true);

-- Les admins peuvent créer des trajets
DROP POLICY IF EXISTS "admins_insert_trajets" ON trajets;
CREATE POLICY "admins_insert_trajets"
ON trajets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- Les admins peuvent modifier des trajets
DROP POLICY IF EXISTS "admins_update_trajets" ON trajets;
CREATE POLICY "admins_update_trajets"
ON trajets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- Les admins peuvent supprimer des trajets
DROP POLICY IF EXISTS "admins_delete_trajets" ON trajets;
CREATE POLICY "admins_delete_trajets"
ON trajets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- =====================================================
-- POLITIQUES POUR LA TABLE COMPAGNIES
-- =====================================================

-- Tout le monde (connecté) peut voir les compagnies
DROP POLICY IF EXISTS "authenticated_select_compagnies" ON compagnies;
CREATE POLICY "authenticated_select_compagnies"
ON compagnies
FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs anonymes peuvent aussi voir les compagnies
DROP POLICY IF EXISTS "anon_select_compagnies" ON compagnies;
CREATE POLICY "anon_select_compagnies"
ON compagnies
FOR SELECT
TO anon
USING (true);

-- Les admins peuvent créer des compagnies
DROP POLICY IF EXISTS "admins_insert_compagnies" ON compagnies;
CREATE POLICY "admins_insert_compagnies"
ON compagnies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- Les admins peuvent modifier des compagnies
DROP POLICY IF EXISTS "admins_update_compagnies" ON compagnies;
CREATE POLICY "admins_update_compagnies"
ON compagnies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- Les admins peuvent supprimer des compagnies
DROP POLICY IF EXISTS "admins_delete_compagnies" ON compagnies;
CREATE POLICY "admins_delete_compagnies"
ON compagnies
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- =====================================================
-- POLITIQUES POUR LA TABLE FAVORIS
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres favoris
DROP POLICY IF EXISTS "users_select_own_favoris" ON favoris;
CREATE POLICY "users_select_own_favoris"
ON favoris
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des favoris
DROP POLICY IF EXISTS "users_insert_own_favoris" ON favoris;
CREATE POLICY "users_insert_own_favoris"
ON favoris
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs favoris
DROP POLICY IF EXISTS "users_delete_own_favoris" ON favoris;
CREATE POLICY "users_delete_own_favoris"
ON favoris
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- POLITIQUES POUR LA TABLE AVIS
-- =====================================================

-- Tout le monde peut voir les avis
DROP POLICY IF EXISTS "public_select_avis" ON avis;
CREATE POLICY "public_select_avis"
ON avis
FOR SELECT
TO authenticated
USING (true);

-- Les utilisateurs peuvent créer des avis
DROP POLICY IF EXISTS "users_insert_avis" ON avis;
CREATE POLICY "users_insert_avis"
ON avis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres avis
DROP POLICY IF EXISTS "users_update_own_avis" ON avis;
CREATE POLICY "users_update_own_avis"
ON avis
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres avis
DROP POLICY IF EXISTS "users_delete_own_avis" ON avis;
CREATE POLICY "users_delete_own_avis"
ON avis
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Les admins peuvent répondre aux avis
DROP POLICY IF EXISTS "admins_respond_to_avis" ON avis;
CREATE POLICY "admins_respond_to_avis"
ON avis
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- =====================================================
-- RENDRE UN COMPTE ADMIN
-- =====================================================
-- Remplacez 'votre-email@example.com' par votre vrai email

-- UPDATE profiles 
-- SET admin = true 
-- WHERE id IN (
--   SELECT id FROM auth.users 
--   WHERE email = 'votre-email@example.com'
-- );

-- OU si vous êtes déjà connecté :
-- UPDATE profiles 
-- SET admin = true 
-- WHERE id = auth.uid();

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'reservations', 'trajets', 'compagnies', 'favoris', 'avis');

-- Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier votre statut admin
SELECT id, email, admin, full_name 
FROM profiles 
WHERE id = auth.uid();

-- Compter les données
SELECT 
  'Utilisateurs' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Réservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'Trajets', COUNT(*) FROM trajets
UNION ALL
SELECT 'Compagnies', COUNT(*) FROM compagnies
UNION ALL
SELECT 'Favoris', COUNT(*) FROM favoris
UNION ALL
SELECT 'Avis', COUNT(*) FROM avis;
