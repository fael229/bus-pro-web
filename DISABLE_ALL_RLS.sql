-- ══════════════════════════════════════════════════════════════════════
-- SOLUTION TEMPORAIRE : Désactiver TOUS les RLS
-- ══════════════════════════════════════════════════════════════════════
-- ⚠️ À utiliser UNIQUEMENT pour tester si les RLS sont le problème
-- ⚠️ NE PAS LAISSER COMME ÇA EN PRODUCTION
-- ══════════════════════════════════════════════════════════════════════

-- Désactiver RLS sur toutes les tables
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE trajets DISABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE favoris DISABLE ROW LEVEL SECURITY;
ALTER TABLE avis DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier
SELECT 
  tablename,
  rowsecurity as "RLS activé (doit être false)"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('destinations', 'trajets', 'compagnies', 'reservations', 'favoris', 'avis', 'profiles')
ORDER BY tablename;

-- ══════════════════════════════════════════════════════════════════════
-- APRÈS AVOIR EXÉCUTÉ CE SCRIPT :
-- ══════════════════════════════════════════════════════════════════════
-- 1. Allez sur votre page d'accueil
-- 2. Rechargez (F5)
-- 3. Est-ce que les données s'affichent maintenant ?
--
-- SI OUI → Le problème vient bien des RLS policies
--          → Réactivez RLS et utilisez FIX_PUBLIC_ACCESS.sql
--
-- SI NON → Le problème vient de l'application
--          → Regardez la console du navigateur (F12)
--          → Vérifiez les variables d'environnement (.env)
--
-- ══════════════════════════════════════════════════════════════════════
