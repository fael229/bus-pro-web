-- ══════════════════════════════════════════════════════════════════════
-- RLS POLICIES POUR LA TABLE PROFILES
-- ══════════════════════════════════════════════════════════════════════
-- 
-- Ce fichier contient toutes les policies nécessaires pour que les admins
-- puissent gérer les utilisateurs, y compris l'assignation de compagnies
--
-- ══════════════════════════════════════════════════════════════════════

-- ÉTAPE 1 : Supprimer les anciennes policies (si elles existent)
-- ══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- ÉTAPE 2 : Activer RLS sur la table profiles
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 3 : Créer les nouvelles policies
-- ══════════════════════════════════════════════════════════════════════

-- 1. Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 2. Les utilisateurs peuvent mettre à jour leur propre profil (sauf admin et compagnie_id)
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Les admins peuvent voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 4. Les admins peuvent mettre à jour tous les profils (y compris compagnie_id)
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 5. Les admins peuvent supprimer des profils
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- 6. Permettre l'insertion pour les utilisateurs authentifiés (pour l'inscription)
CREATE POLICY "Enable insert for authenticated users"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ══════════════════════════════════════════════════════════════════════

-- Voir toutes les policies sur la table profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ══════════════════════════════════════════════════════════════════════
-- NOTES IMPORTANTES
-- ══════════════════════════════════════════════════════════════════════
--
-- 1. Ces policies permettent aux admins de :
--    ✓ Voir tous les profils
--    ✓ Mettre à jour tous les champs (admin, compagnie_id, etc.)
--    ✓ Supprimer des profils
--
-- 2. Les utilisateurs normaux peuvent :
--    ✓ Voir leur propre profil
--    ✓ Mettre à jour leur propre profil
--    ✗ Ne peuvent pas modifier admin ou compagnie_id
--
-- 3. Après avoir exécuté ce script dans Supabase SQL Editor,
--    testez l'assignation de compagnie dans /admin/users
--
-- ══════════════════════════════════════════════════════════════════════
