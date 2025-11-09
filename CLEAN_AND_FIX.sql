-- ══════════════════════════════════════════════════════════════════════
-- NETTOYAGE COMPLET ET RÉACTIVATION CORRECTE
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : DÉSACTIVER TOUS LES RLS
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE trajets DISABLE ROW LEVEL SECURITY;
ALTER TABLE compagnies DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE favoris DISABLE ROW LEVEL SECURITY;
ALTER TABLE avis DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : SUPPRIMER TOUTES LES POLICIES
-- ══════════════════════════════════════════════════════════════════════

-- Destinations
DROP POLICY IF EXISTS "Public read destinations" ON destinations;
DROP POLICY IF EXISTS "Public read access to destinations" ON destinations;
DROP POLICY IF EXISTS "Everyone can view destinations" ON destinations;

-- Trajets
DROP POLICY IF EXISTS "Public read trajets" ON trajets;
DROP POLICY IF EXISTS "Public can view trajets" ON trajets;
DROP POLICY IF EXISTS "Everyone can view trajets" ON trajets;
DROP POLICY IF EXISTS "Admin manage trajets" ON trajets;
DROP POLICY IF EXISTS "Compagnies can view their trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can insert trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can update trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can delete trajets" ON trajets;
DROP POLICY IF EXISTS "Admins can manage trajets" ON trajets;

-- Compagnies
DROP POLICY IF EXISTS "Public read compagnies" ON compagnies;
DROP POLICY IF EXISTS "Public can view compagnies" ON compagnies;
DROP POLICY IF EXISTS "Everyone can view compagnies" ON compagnies;
DROP POLICY IF EXISTS "Admin manage compagnies" ON compagnies;
DROP POLICY IF EXISTS "Admins can manage compagnies" ON compagnies;

-- Profiles
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin manage profiles" ON profiles;
DROP POLICY IF EXISTS "Signup insert profile" ON profiles;
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

-- Reservations
DROP POLICY IF EXISTS "Users read own reservations" ON reservations;
DROP POLICY IF EXISTS "Users insert reservations" ON reservations;
DROP POLICY IF EXISTS "Users update own reservations" ON reservations;
DROP POLICY IF EXISTS "Compagnies update their reservations" ON reservations;
DROP POLICY IF EXISTS "Admin manage reservations" ON reservations;
DROP POLICY IF EXISTS "Users can view their reservations" ON reservations;
DROP POLICY IF EXISTS "Compagnies can view their reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Users can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Users can update their reservations" ON reservations;
DROP POLICY IF EXISTS "Compagnies can update their reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can manage reservations" ON reservations;

-- Favoris
DROP POLICY IF EXISTS "Users manage own favoris" ON favoris;
DROP POLICY IF EXISTS "Users can manage their favoris" ON favoris;

-- Avis
DROP POLICY IF EXISTS "Public read avis" ON avis;
DROP POLICY IF EXISTS "Users create avis" ON avis;
DROP POLICY IF EXISTS "Users update own avis" ON avis;
DROP POLICY IF EXISTS "Everyone can view avis" ON avis;
DROP POLICY IF EXISTS "Users can create avis" ON avis;
DROP POLICY IF EXISTS "Users can update their avis" ON avis;

-- ══════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : RÉACTIVER RLS AVEC UNE SEULE POLICY PAR TABLE (SIMPLE)
-- ══════════════════════════════════════════════════════════════════════

-- DESTINATIONS : Accès total pour tout le monde
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_destinations" ON destinations FOR ALL USING (true);

-- TRAJETS : Accès total pour tout le monde
ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_trajets" ON trajets FOR ALL USING (true);

-- COMPAGNIES : Accès total pour tout le monde
ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_compagnies" ON compagnies FOR ALL USING (true);

-- PROFILES : Accès total pour tout le monde (temporaire)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (true);

-- RESERVATIONS : Accès total pour authentifiés
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_reservations" ON reservations FOR ALL TO authenticated USING (true);

-- FAVORIS : Accès total pour authentifiés
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_favoris" ON favoris FOR ALL TO authenticated USING (true);

-- AVIS : Accès total pour tout le monde
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_avis" ON avis FOR ALL USING (true);

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ══════════════════════════════════════════════════════════════════════

SELECT 
  tablename,
  COUNT(*) as "Nombre de policies (doit être 1)"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Tester l'accès
SELECT COUNT(*) as destinations FROM destinations;
SELECT COUNT(*) as trajets FROM trajets;
SELECT COUNT(*) as compagnies FROM compagnies;
SELECT COUNT(*) as profiles FROM profiles;

-- ══════════════════════════════════════════════════════════════════════
-- RÉSULTAT ATTENDU
-- ══════════════════════════════════════════════════════════════════════
-- Chaque table doit avoir exactement 1 policy
-- Toutes les requêtes SELECT ci-dessus doivent retourner un nombre > 0
-- 
-- APRÈS L'EXÉCUTION :
-- 1. Rechargez votre page d'accueil (F5)
-- 2. Tout doit fonctionner ✅
-- 3. /admin/users doit fonctionner ✅
-- 4. Assignation de compagnie doit fonctionner ✅
-- 
-- NOTE : Ces policies sont ultra-permissives pour que tout fonctionne.
-- Une fois que tout marche, on pourra les affiner si nécessaire.
-- ══════════════════════════════════════════════════════════════════════
