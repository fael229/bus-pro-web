-- ══════════════════════════════════════════════════════════════════════
-- FIX : CORRECTION DES RLS POLICIES POUR PROFILES
-- ══════════════════════════════════════════════════════════════════════
-- 
-- Ce script corrige le problème "plus aucune donnée ne s'affiche"
-- causé par des policies trop restrictives ou en conflit
--
-- ══════════════════════════════════════════════════════════════════════

-- ÉTAPE 1 : SUPPRIMER TOUTES LES POLICIES EXISTANTES
-- ══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow everything for admins (DEBUG)" ON profiles;

-- ÉTAPE 2 : DÉSACTIVER TEMPORAIREMENT RLS (pour voir si c'est ça le problème)
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 3 : TESTER SI LES DONNÉES S'AFFICHENT MAINTENANT
-- ══════════════════════════════════════════════════════════════════════
-- 
-- Allez sur /admin/users et vérifiez si les utilisateurs s'affichent
-- Si OUI : le problème vient bien des RLS policies
-- Si NON : le problème est ailleurs
--
-- ══════════════════════════════════════════════════════════════════════

-- ÉTAPE 4 : RÉACTIVER RLS ET CRÉER DES POLICIES SIMPLES
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1 : Tout le monde peut voir tous les profils (pour l'instant)
-- Cette policy ultra-permissive permet de déboguer
CREATE POLICY "Everyone can view profiles"
ON profiles FOR SELECT
TO authenticated, anon
USING (true);

-- Policy 2 : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Policy 3 : Les admins peuvent tout faire
CREATE POLICY "Admins have full access"
ON profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND admin = true
  )
);

-- Policy 4 : Permettre l'insertion pour nouveaux utilisateurs
CREATE POLICY "Enable insert during signup"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ══════════════════════════════════════════════════════════════════════

-- Voir les policies créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Tester une requête SELECT
SELECT id, email, admin, compagnie_id FROM profiles LIMIT 5;

-- ══════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS
-- ══════════════════════════════════════════════════════════════════════
--
-- 1. Exécutez ce script COMPLET dans Supabase SQL Editor
-- 2. Attendez la confirmation "Success. No rows returned"
-- 3. Allez sur /admin/users dans votre application
-- 4. Rechargez la page (F5)
-- 5. Les utilisateurs devraient s'afficher
-- 6. Testez l'assignation de compagnie
--
-- ══════════════════════════════════════════════════════════════════════
