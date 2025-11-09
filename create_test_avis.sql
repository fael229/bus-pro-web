-- =====================================================
-- SCRIPT RAPIDE : CRÉER DES AVIS DE TEST
-- =====================================================
-- Copiez-collez ce script dans Supabase SQL Editor
-- =====================================================

-- 1. Activer RLS sur la table avis
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

-- 2. Créer la politique de lecture PUBLIQUE (essentiel !)
DROP POLICY IF EXISTS "public_select_avis" ON avis;
CREATE POLICY "public_select_avis"
ON avis
FOR SELECT
TO authenticated, anon
USING (true);

-- 3. Créer la politique d'insertion pour les utilisateurs
DROP POLICY IF EXISTS "users_insert_avis" ON avis;
CREATE POLICY "users_insert_avis"
ON avis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Créer des avis de test pour CHAQUE trajet
DO $$
DECLARE
  v_trajet record;
  v_count integer := 0;
BEGIN
  -- Pour chaque trajet, créer 2-3 avis
  FOR v_trajet IN SELECT id, depart, arrivee FROM trajets LOOP
    
    -- Avis 1
    INSERT INTO avis (user_id, trajet_id, note, commentaire)
    VALUES (
      auth.uid(),
      v_trajet.id,
      5,
      'Excellent trajet ' || v_trajet.depart || ' → ' || v_trajet.arrivee || ' ! Très ponctuel et confortable.'
    );
    
    -- Avis 2
    INSERT INTO avis (user_id, trajet_id, note, commentaire)
    VALUES (
      auth.uid(),
      v_trajet.id,
      4,
      'Bon service pour ' || v_trajet.depart || ' → ' || v_trajet.arrivee || '. Je recommande.'
    );
    
    -- Avis 3 (pas toujours)
    IF random() > 0.5 THEN
      INSERT INTO avis (user_id, trajet_id, note, commentaire)
      VALUES (
        auth.uid(),
        v_trajet.id,
        FLOOR(3 + random() * 3)::integer, -- Note entre 3 et 5
        'Trajet correct, rien à signaler de particulier.'
      );
    END IF;
    
    v_count := v_count + 1;
    
  END LOOP;
  
  RAISE NOTICE '✅ Avis créés pour % trajets', v_count;
END $$;

-- 5. Vérifier les avis créés
SELECT 
  t.depart || ' → ' || t.arrivee as trajet,
  COUNT(a.id) as nb_avis,
  ROUND(AVG(a.note)::numeric, 1) as note_moyenne
FROM trajets t
LEFT JOIN avis a ON t.id = a.trajet_id
GROUP BY t.id, t.depart, t.arrivee
ORDER BY nb_avis DESC;

-- 6. Voir quelques avis
SELECT 
  a.note,
  a.commentaire,
  t.depart || ' → ' || t.arrivee as trajet,
  a.created_at
FROM avis a
JOIN trajets t ON a.trajet_id = t.id
ORDER BY a.created_at DESC
LIMIT 10;

-- =====================================================
-- MESSAGE FINAL
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '=====================================';
  RAISE NOTICE '✅ Script terminé !';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Prochaines étapes :';
  RAISE NOTICE '1. Actualisez votre application web (Ctrl+R)';
  RAISE NOTICE '2. Allez sur la page d''un trajet (/trajet/:id)';
  RAISE NOTICE '3. Ouvrez la console (F12)';
  RAISE NOTICE '4. Vérifiez les logs : "✅ Avis loaded: X"';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Si aucun avis ne s''affiche :';
  RAISE NOTICE '- Consultez DEBUG_AVIS.md';
  RAISE NOTICE '- Vérifiez la console pour les erreurs';
  RAISE NOTICE '';
END $$;
