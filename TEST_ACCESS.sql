-- ══════════════════════════════════════════════════════════════════════
-- TEST : Vérifier l'accès aux données
-- ══════════════════════════════════════════════════════════════════════

-- 1. Vérifier RLS sur chaque table
SELECT 
  tablename,
  rowsecurity as "RLS activé"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('destinations', 'trajets', 'compagnies', 'reservations', 'favoris', 'avis', 'profiles')
ORDER BY tablename;

-- 2. Compter les données dans chaque table
SELECT 'destinations' as table_name, COUNT(*) as count FROM destinations
UNION ALL
SELECT 'trajets', COUNT(*) FROM trajets
UNION ALL
SELECT 'compagnies', COUNT(*) FROM compagnies
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'avis', COUNT(*) FROM avis
UNION ALL
SELECT 'favoris', COUNT(*) FROM favoris
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- 3. Tester SELECT sur destinations
SELECT * FROM destinations LIMIT 3;

-- 4. Tester SELECT sur trajets avec compagnies
SELECT 
  t.id,
  t.depart,
  t.arrivee,
  t.prix,
  c.nom as compagnie_nom
FROM trajets t
LEFT JOIN compagnies c ON t.compagnie_id = c.id
LIMIT 3;

-- 5. Voir les policies sur destinations
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'destinations';

-- 6. Voir les policies sur trajets
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'trajets';

-- ══════════════════════════════════════════════════════════════════════
-- Si toutes les requêtes ci-dessus fonctionnent dans Supabase,
-- alors le problème vient de l'APPLICATION (pas de Supabase)
-- ══════════════════════════════════════════════════════════════════════
