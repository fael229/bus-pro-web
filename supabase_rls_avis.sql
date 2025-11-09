-- =====================================================
-- POLITIQUES RLS POUR LA TABLE AVIS
-- =====================================================

-- Activer RLS
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- 1. Tout le monde peut VOIR les avis (lecture publique)
DROP POLICY IF EXISTS "public_select_avis" ON avis;
CREATE POLICY "public_select_avis"
ON avis
FOR SELECT
TO authenticated, anon
USING (true);

-- 2. Les utilisateurs connectés peuvent CRÉER des avis
DROP POLICY IF EXISTS "users_insert_avis" ON avis;
CREATE POLICY "users_insert_avis"
ON avis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Les utilisateurs peuvent MODIFIER leurs propres avis
DROP POLICY IF EXISTS "users_update_own_avis" ON avis;
CREATE POLICY "users_update_own_avis"
ON avis
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Les utilisateurs peuvent SUPPRIMER leurs propres avis
DROP POLICY IF EXISTS "users_delete_own_avis" ON avis;
CREATE POLICY "users_delete_own_avis"
ON avis
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Les admins peuvent TOUT faire sur les avis (modération)
DROP POLICY IF EXISTS "admins_all_on_avis" ON avis;
CREATE POLICY "admins_all_on_avis"
ON avis
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.admin = true
  )
);

-- =====================================================
-- FONCTION POUR METTRE À JOUR LA NOTE MOYENNE
-- =====================================================
-- Cette fonction recalcule automatiquement la note et le nombre d'avis
-- d'un trajet après l'ajout/modification/suppression d'un avis

CREATE OR REPLACE FUNCTION update_trajet_note()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculer la note moyenne et le nombre d'avis
  UPDATE trajets
  SET 
    note = (
      SELECT COALESCE(AVG(note), 0)
      FROM avis
      WHERE trajet_id = COALESCE(NEW.trajet_id, OLD.trajet_id)
    ),
    nb_avis = (
      SELECT COUNT(*)
      FROM avis
      WHERE trajet_id = COALESCE(NEW.trajet_id, OLD.trajet_id)
    )
  WHERE id = COALESCE(NEW.trajet_id, OLD.trajet_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger après insertion d'un avis
DROP TRIGGER IF EXISTS update_trajet_note_on_insert ON avis;
CREATE TRIGGER update_trajet_note_on_insert
AFTER INSERT ON avis
FOR EACH ROW
EXECUTE FUNCTION update_trajet_note();

-- Trigger après modification d'un avis
DROP TRIGGER IF EXISTS update_trajet_note_on_update ON avis;
CREATE TRIGGER update_trajet_note_on_update
AFTER UPDATE ON avis
FOR EACH ROW
EXECUTE FUNCTION update_trajet_note();

-- Trigger après suppression d'un avis
DROP TRIGGER IF EXISTS update_trajet_note_on_delete ON avis;
CREATE TRIGGER update_trajet_note_on_delete
AFTER DELETE ON avis
FOR EACH ROW
EXECUTE FUNCTION update_trajet_note();

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'avis';

-- Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'avis'
ORDER BY policyname;

-- Vérifier les triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'avis';

-- =====================================================
-- TESTS
-- =====================================================

-- Test 1 : Créer un avis
-- INSERT INTO avis (user_id, trajet_id, note, commentaire)
-- VALUES (auth.uid(), 'trajet-id-here', 5, 'Excellent service !');

-- Test 2 : Voir les avis d'un trajet
-- SELECT * FROM avis WHERE trajet_id = 'trajet-id-here';

-- Test 3 : Vérifier que la note du trajet a été mise à jour
-- SELECT id, depart, arrivee, note, nb_avis FROM trajets WHERE id = 'trajet-id-here';

-- Test 4 : Modifier son avis
-- UPDATE avis SET note = 4, commentaire = 'Très bien' WHERE id = 'avis-id' AND user_id = auth.uid();

-- Test 5 : Supprimer son avis
-- DELETE FROM avis WHERE id = 'avis-id' AND user_id = auth.uid();

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Créer quelques avis de test (remplacer les IDs)
/*
INSERT INTO avis (user_id, trajet_id, note, commentaire)
SELECT 
  auth.uid(),
  (SELECT id FROM trajets LIMIT 1),
  5,
  'Super trajet, très ponctuel et confortable !'
WHERE EXISTS (SELECT 1 FROM trajets LIMIT 1);

INSERT INTO avis (user_id, trajet_id, note, commentaire)
SELECT 
  auth.uid(),
  (SELECT id FROM trajets LIMIT 1),
  4,
  'Bon service, quelques retards mais globalement satisfait.'
WHERE EXISTS (SELECT 1 FROM trajets LIMIT 1);
*/
