-- ══════════════════════════════════════════════════════════════════════
-- SCRIPT DE DIAGNOSTIC RLS
-- ══════════════════════════════════════════════════════════════════════

-- 1. Vérifier l'utilisateur actuel
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  auth.uid() as "Mon user_id",
  auth.role() as "Mon rôle";

-- 2. Vérifier mon profil et statut admin
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  id,
  email,
  admin,
  compagnie_id,
  'Mon profil' as info
FROM profiles 
WHERE id = auth.uid();

-- 3. Vérifier si RLS est activé
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  tablename,
  rowsecurity as "RLS activé"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'trajets', 'reservations', 'compagnies');

-- 4. Lister toutes les policies sur profiles
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  policyname as "Nom de la policy",
  cmd as "Commande",
  permissive as "Permissive",
  roles as "Rôles",
  qual as "Condition USING",
  with_check as "Condition WITH CHECK"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 5. Compter les utilisateurs (devrait fonctionner si vous êtes admin)
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  COUNT(*) as "Nombre total d'utilisateurs",
  COUNT(CASE WHEN admin = true THEN 1 END) as "Admins",
  COUNT(CASE WHEN compagnie_id IS NOT NULL THEN 1 END) as "Gestionnaires compagnie",
  COUNT(CASE WHEN admin = false AND compagnie_id IS NULL THEN 1 END) as "Utilisateurs normaux"
FROM profiles;

-- 6. Tester une requête SELECT simple
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  id,
  email,
  admin,
  compagnie_id,
  updated_at
FROM profiles
ORDER BY updated_at DESC
LIMIT 5;

-- ══════════════════════════════════════════════════════════════════════
-- INTERPRÉTATION DES RÉSULTATS
-- ══════════════════════════════════════════════════════════════════════
--
-- Si la requête 2 (mon profil) retourne 0 lignes :
-- → Vous n'avez pas de profil dans la table profiles
-- → Solution : Créer un profil avec admin = true
--
-- Si la requête 2 montre admin = false :
-- → Vous n'êtes pas admin
-- → Solution : UPDATE profiles SET admin = true WHERE id = auth.uid()
--
-- Si la requête 4 montre 0 policies :
-- → RLS est activé mais aucune policy existe
-- → Solution : Exécuter FIX_RLS_POLICIES.sql
--
-- Si la requête 5 ou 6 retourne "permission denied" :
-- → Les policies bloquent l'accès
-- → Solution : Exécuter FIX_RLS_POLICIES.sql
--
-- Si la requête 6 retourne des données :
-- → RLS fonctionne correctement
-- → Le problème vient de l'application (pas de Supabase)
--
-- ══════════════════════════════════════════════════════════════════════
