-- ══════════════════════════════════════════════════════════════════════
-- CRÉER OU PROMOUVOIR UN ADMIN
-- ══════════════════════════════════════════════════════════════════════
--
-- Ce script permet de créer un admin ou de promouvoir un utilisateur
-- existant en admin, EN CONTOURNANT les RLS policies.
--
-- ══════════════════════════════════════════════════════════════════════

-- MÉTHODE 1 : Promouvoir l'utilisateur actuel en admin
-- ══════════════════════════════════════════════════════════════════════

-- Désactiver temporairement RLS pour permettre la modification
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Promouvoir l'utilisateur actuel
UPDATE profiles
SET admin = true
WHERE id = auth.uid();

-- Vérifier
SELECT id, email, admin FROM profiles WHERE id = auth.uid();

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════

-- MÉTHODE 2 : Promouvoir un utilisateur spécifique par email
-- ══════════════════════════════════════════════════════════════════════

-- Désactiver RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remplacer 'EMAIL@EXAMPLE.COM' par l'email de l'utilisateur
UPDATE profiles
SET admin = true
WHERE email = 'krang229@gmail.com';  -- ← MODIFIER CET EMAIL

-- Vérifier
SELECT id, email, admin FROM profiles WHERE email = 'krang229@gmail.com';

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════

-- MÉTHODE 3 : Promouvoir TOUS les utilisateurs en admin (DANGER!)
-- ══════════════════════════════════════════════════════════════════════
-- ⚠️ À utiliser UNIQUEMENT en développement
-- ⚠️ NE JAMAIS utiliser en production

-- Désactiver RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Promouvoir TOUS les utilisateurs
UPDATE profiles SET admin = true;

-- Vérifier
SELECT email, admin FROM profiles;

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════

-- MÉTHODE 4 : Créer un nouveau profil admin manuellement
-- ══════════════════════════════════════════════════════════════════════

-- Désactiver RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ATTENTION : Vous devez d'abord créer l'utilisateur dans Supabase Auth
-- Ensuite, utilisez son UUID ici

-- Remplacer les valeurs ci-dessous
INSERT INTO profiles (
  id,
  email,
  username,
  full_name,
  admin,
  compagnie_id
) VALUES (
  'UUID-DE-UTILISATEUR-AUTH',  -- ← UUID depuis Auth
  'admin@example.com',          -- ← Email
  'admin',                       -- ← Username
  'Administrateur',              -- ← Nom complet
  true,                          -- ← Admin
  NULL                           -- ← Pas de compagnie
)
ON CONFLICT (id) DO UPDATE
SET admin = true;

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════
-- INSTRUCTIONS D'UTILISATION
-- ══════════════════════════════════════════════════════════════════════
--
-- POUR DÉBOGUER LE PROBLÈME "AUCUNE DONNÉE NE S'AFFICHE" :
--
-- 1. Choisissez UNE méthode ci-dessus (recommandé : Méthode 2)
-- 2. Modifiez l'email si nécessaire
-- 3. Exécutez UNIQUEMENT la méthode choisie dans Supabase SQL Editor
-- 4. Vérifiez que l'utilisateur est maintenant admin
-- 5. Ensuite, exécutez FIX_RLS_POLICIES.sql
-- 6. Rechargez /admin/users dans votre application
--
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- ══════════════════════════════════════════════════════════════════════

-- Voir tous les admins
SELECT 
  id,
  email,
  username,
  admin,
  compagnie_id,
  updated_at
FROM profiles
WHERE admin = true;

-- ══════════════════════════════════════════════════════════════════════
