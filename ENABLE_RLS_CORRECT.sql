-- ══════════════════════════════════════════════════════════════════════
-- RÉACTIVER LES RLS AVEC DES POLICIES CORRECTES
-- ══════════════════════════════════════════════════════════════════════
-- Ce script réactive les RLS avec des policies qui fonctionnent
-- ══════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════
-- 1. DESTINATIONS - Accès public en lecture
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read destinations"
ON destinations FOR SELECT
USING (true);

-- ══════════════════════════════════════════════════════════════════════
-- 2. COMPAGNIES - Accès public en lecture, admin en écriture
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE compagnies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read compagnies"
ON compagnies FOR SELECT
USING (true);

CREATE POLICY "Admin manage compagnies"
ON compagnies FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- 3. TRAJETS - Accès public en lecture, admin en écriture
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE trajets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trajets"
ON trajets FOR SELECT
USING (true);

CREATE POLICY "Admin manage trajets"
ON trajets FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- 4. PROFILES - Voir son profil, admin voit tout
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admin manage profiles"
ON profiles FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

CREATE POLICY "Signup insert profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════
-- 5. RESERVATIONS - User voit les siennes, compagnie/admin voient leurs données
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reservations"
ON reservations FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
  OR trajet_id IN (
    SELECT t.id FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Users insert reservations"
ON reservations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users update own reservations"
ON reservations FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Compagnies update their reservations"
ON reservations FOR UPDATE
USING (
  trajet_id IN (
    SELECT t.id FROM trajets t
    INNER JOIN profiles p ON t.compagnie_id = p.compagnie_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Admin manage reservations"
ON reservations FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND admin = true)
);

-- ══════════════════════════════════════════════════════════════════════
-- 6. FAVORIS - User gère ses favoris
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favoris"
ON favoris FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════
-- 7. AVIS - Lecture publique, création/modification par users
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE avis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read avis"
ON avis FOR SELECT
USING (true);

CREATE POLICY "Users create avis"
ON avis FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own avis"
ON avis FOR UPDATE
USING (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ══════════════════════════════════════════════════════════════════════

-- Voir RLS actif
SELECT 
  tablename,
  rowsecurity as "RLS"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('destinations', 'trajets', 'compagnies', 'reservations', 'favoris', 'avis', 'profiles')
ORDER BY tablename;

-- Compter les policies
SELECT 
  tablename,
  COUNT(*) as "Nb policies"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Tester l'accès
SELECT COUNT(*) as "Destinations" FROM destinations;
SELECT COUNT(*) as "Trajets" FROM trajets;
SELECT COUNT(*) as "Compagnies" FROM compagnies;

-- ══════════════════════════════════════════════════════════════════════
-- APRÈS L'EXÉCUTION :
-- ══════════════════════════════════════════════════════════════════════
-- 1. Allez sur votre page d'accueil
-- 2. Rechargez (F5)
-- 3. Tout devrait fonctionner ✅
-- 4. Testez aussi /admin/users
-- 5. Testez l'assignation de compagnie
-- 6. Testez l'accès à /compagnie
-- ══════════════════════════════════════════════════════════════════════
