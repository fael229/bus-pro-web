-- =====================================================
-- CORRECTION : Compagnie non trouvée
-- =====================================================
-- Créer les politiques RLS pour la table compagnies
-- =====================================================

-- 1. Activer RLS sur la table compagnies
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;

-- 2. LECTURE PUBLIQUE - Tout le monde peut voir les compagnies
DROP POLICY IF EXISTS "public_select_compagnies" ON compagnies;
CREATE POLICY "public_select_compagnies"
ON compagnies
FOR SELECT
TO authenticated, anon
USING (true);

-- 3. Les admins peuvent créer des compagnies
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

-- 4. Les admins peuvent modifier des compagnies
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

-- 5. Les admins peuvent supprimer des compagnies
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
-- VÉRIFICATIONS
-- =====================================================

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'compagnies';

-- Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'compagnies'
ORDER BY policyname;

-- =====================================================
-- TESTS
-- =====================================================

-- Test 1 : Voir toutes les compagnies (devrait fonctionner)
SELECT id, nom, telephone FROM compagnies;

-- Test 2 : Compter les compagnies
SELECT COUNT(*) as nb_compagnies FROM compagnies;

-- Test 3 : Voir une compagnie spécifique
-- SELECT * FROM compagnies WHERE id = 'VOTRE_ID_ICI';

-- Test 4 : Voir les compagnies avec leurs trajets
SELECT 
  c.id,
  c.nom,
  c.telephone,
  COUNT(t.id) as nb_trajets
FROM compagnies c
LEFT JOIN trajets t ON c.id = t.compagnie_id
GROUP BY c.id, c.nom, c.telephone
ORDER BY c.nom;

-- =====================================================
-- DONNÉES DE TEST (si besoin)
-- =====================================================

-- Créer une compagnie de test si aucune n'existe
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM compagnies;
  
  IF v_count = 0 THEN
    INSERT INTO compagnies (nom, telephone, adresse)
    VALUES 
      ('Transport Express Bénin', '+229 97 00 00 01', 'Cotonou, Bénin'),
      ('Voyages Confort', '+229 96 00 00 02', 'Porto-Novo, Bénin'),
      ('Bus Rapide', '+229 95 00 00 03', 'Parakou, Bénin');
    
    RAISE NOTICE '✅ 3 compagnies de test créées';
  ELSE
    RAISE NOTICE 'ℹ️ Il y a déjà % compagnie(s) dans la base', v_count;
  END IF;
END $$;

-- Vérifier les compagnies créées
SELECT id, nom, telephone, adresse FROM compagnies;

-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '=====================================';
  RAISE NOTICE '✅ Script terminé !';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes :';
  RAISE NOTICE '1. Actualisez votre application (Ctrl+R)';
  RAISE NOTICE '2. Ouvrez la console (F12)';
  RAISE NOTICE '3. Cliquez sur le nom d''une compagnie';
  RAISE NOTICE '4. Vérifiez les logs : "✅ Compagnie loaded"';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Si "Compagnie non trouvée" persiste :';
  RAISE NOTICE '- Vérifiez que l''ID existe dans la base';
  RAISE NOTICE '- Vérifiez les logs de la console';
  RAISE NOTICE '';
END $$;
