-- =====================================================
-- CORRECTION ERREUR 406 SUR LES FAVORIS
-- =====================================================
-- L'erreur 406 indique un problème de politiques RLS
-- =====================================================

-- 1. Activer RLS sur la table favoris
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;

-- 2. Les utilisateurs peuvent voir leurs propres favoris
DROP POLICY IF EXISTS "users_select_own_favoris" ON favoris;
CREATE POLICY "users_select_own_favoris"
ON favoris
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Les utilisateurs peuvent ajouter des favoris
DROP POLICY IF EXISTS "users_insert_own_favoris" ON favoris;
CREATE POLICY "users_insert_own_favoris"
ON favoris
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Les utilisateurs peuvent supprimer leurs favoris
DROP POLICY IF EXISTS "users_delete_own_favoris" ON favoris;
CREATE POLICY "users_delete_own_favoris"
ON favoris
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'favoris';

-- Vérifier les politiques
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'favoris';

-- Test : Voir mes favoris
SELECT * FROM favoris WHERE user_id = auth.uid();

-- =====================================================
RAISE NOTICE '✅ Politiques RLS pour favoris créées avec succès !';
RAISE NOTICE 'L''erreur 406 devrait être résolue.';
