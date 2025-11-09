-- ══════════════════════════════════════════════════════════════════════
-- QUICK FIX : Exécuter ce script pour réparer l'affichage des données
-- ══════════════════════════════════════════════════════════════════════
-- Temps : 10 secondes
-- ══════════════════════════════════════════════════════════════════════

-- ÉTAPE 1 : Nettoyer TOUTES les policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full access" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert during signup" ON profiles;

-- ÉTAPE 2 : Désactiver RLS temporairement
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 3 : Vous promouvoir admin (MODIFIER L'EMAIL CI-DESSOUS)
UPDATE profiles 
SET admin = true 
WHERE email = 'krang229@gmail.com';  -- ← VOTRE EMAIL ICI

-- ÉTAPE 4 : Réactiver RLS avec policies simples
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view profiles"
ON profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins have full access"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable insert during signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ÉTAPE 5 : Vérification
SELECT 
  email,
  admin,
  compagnie_id,
  'Votre profil' as info
FROM profiles 
WHERE email = 'krang229@gmail.com';  -- ← VOTRE EMAIL ICI

-- ══════════════════════════════════════════════════════════════════════
-- SUCCÈS SI :
-- ══════════════════════════════════════════════════════════════════════
-- La requête ci-dessus affiche : admin = true
--
-- MAINTENANT :
-- 1. Allez sur /admin/users
-- 2. Rechargez (F5)
-- 3. Les utilisateurs s'affichent ✅
-- 4. Vous pouvez assigner des compagnies ✅
-- ══════════════════════════════════════════════════════════════════════
