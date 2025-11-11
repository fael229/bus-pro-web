-- ════════════════════════════════════════════════════════════════════════════
-- 🛣️ TRAJETS DES COMPAGNIES - PARTIE 2 (Trajets retour et inter-villes)
-- ════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- TRAJETS RETOUR : PARAKOU → AUTRES VILLES
-- ─────────────────────────────────────────────────────────────────────────

-- Parakou → Cotonou (Confort Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Cotonou', 5000, '["05:00", "07:00", "09:00", "13:00", "15:00"]'::jsonb, 'Gare de Parakou', 4.4, 119, 'c4444444-4444-4444-4444-444444444444', NOW());

-- Parakou → Natitingou (Express Borgou)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Natitingou', 2500, '["06:00", "08:00", "11:00", "14:00", "16:00"]'::jsonb, 'Gare de Parakou', 4.5, 89, 'cb222222-2222-2222-2222-222222222222', NOW());

-- Parakou → Djougou (Express Borgou)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Djougou', 2000, '["06:00", "08:00", "10:00", "13:00", "15:00", "17:00"]'::jsonb, 'Gare de Parakou', 4.3, 102, 'cb222222-2222-2222-2222-222222222222', NOW());

-- Parakou → Kandi (Alibori Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Kandi', 2000, '["07:00", "10:00", "14:00", "17:00"]'::jsonb, 'Gare de Parakou', 4.2, 67, 'cf666666-6666-6666-6666-666666666666', NOW());

-- Parakou → Malanville (Alibori Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Malanville', 3500, '["06:00", "14:00"]'::jsonb, 'Gare de Parakou', 4.0, 52, 'cf666666-6666-6666-6666-666666666666', NOW());

-- Parakou → Savè (Benin Royal)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Savè', 2500, '["07:00", "10:00", "14:00", "17:00"]'::jsonb, 'Gare de Parakou', 4.3, 71, 'c2222222-2222-2222-2222-222222222222', NOW());

-- Parakou → Tchaourou (Confort Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Tchaourou', 1500, '["06:00", "08:00", "10:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare de Parakou', 4.1, 85, 'c4444444-4444-4444-4444-444444444444', NOW());

-- Parakou → Nikki (Express Borgou)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Parakou', 'Nikki', 2000, '["07:00", "10:00", "15:00"]'::jsonb, 'Gare de Parakou', 4.4, 62, 'cb222222-2222-2222-2222-222222222222', NOW());

-- ─────────────────────────────────────────────────────────────────────────
-- TRAJETS RETOUR : PORTO-NOVO → AUTRES VILLES
-- ─────────────────────────────────────────────────────────────────────────

-- Porto-Novo → Cotonou (Yeye Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Porto-Novo', 'Cotonou', 800, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare Porto-Novo', 4.3, 218, 'c7777777-7777-7777-7777-777777777777', NOW());

-- Porto-Novo → Pobè (Oueme Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Porto-Novo', 'Pobè', 1500, '["07:00", "09:00", "11:00", "14:00", "16:00"]'::jsonb, 'Gare Porto-Novo', 4.1, 73, 'cd444444-4444-4444-4444-444444444444', NOW());

-- Porto-Novo → Sakété (Oueme Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Porto-Novo', 'Sakété', 1200, '["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"]'::jsonb, 'Gare Porto-Novo', 4.0, 95, 'cd444444-4444-4444-4444-444444444444', NOW());

-- Porto-Novo → Adjarra (Oueme Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Porto-Novo', 'Adjarra', 800, '["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare Porto-Novo', 4.2, 104, 'cd444444-4444-4444-4444-444444444444', NOW());

-- ─────────────────────────────────────────────────────────────────────────
-- TRAJETS RETOUR : LOKOSSA → AUTRES VILLES
-- ─────────────────────────────────────────────────────────────────────────

-- Lokossa → Cotonou (Mono Express)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Lokossa', 'Cotonou', 2000, '["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"]'::jsonb, 'Gare Lokossa', 4.2, 108, 'ce555555-5555-5555-5555-555555555555', NOW());

-- Lokossa → Grand-Popo (Mono Express)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Lokossa', 'Grand-Popo', 800, '["07:00", "09:00", "12:00", "15:00", "17:00"]'::jsonb, 'Gare Lokossa', 4.1, 64, 'ce555555-5555-5555-5555-555555555555', NOW());

-- Lokossa → Athiémé (Mono Express)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Lokossa', 'Athiémé', 600, '["07:00", "09:00", "11:00", "13:00", "15:00", "17:00"]'::jsonb, 'Gare Lokossa', 4.0, 57, 'ce555555-5555-5555-5555-555555555555', NOW());

-- Lokossa → Comè (Mono Express)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Lokossa', 'Comè', 1000, '["06:00", "08:00", "10:00", "13:00", "15:00", "17:00"]'::jsonb, 'Gare Lokossa', 4.2, 69, 'ce555555-5555-5555-5555-555555555555', NOW());

-- ─────────────────────────────────────────────────────────────────────────
-- TRAJETS RETOUR : BOHICON → AUTRES VILLES
-- ─────────────────────────────────────────────────────────────────────────

-- Bohicon → Cotonou (Atlantique Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Bohicon', 'Cotonou', 2000, '["05:30", "07:30", "09:30", "12:00", "14:30", "16:30"]'::jsonb, 'Gare Bohicon', 4.3, 142, 'c6666666-6666-6666-6666-666666666666', NOW());

-- Bohicon → Abomey (Atlantique Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Bohicon', 'Abomey', 800, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare Bohicon', 4.4, 178, 'c6666666-6666-6666-6666-666666666666', NOW());

-- Bohicon → Parakou (TTB)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Bohicon', 'Parakou', 4000, '["06:00", "08:00", "14:00"]'::jsonb, 'Gare Bohicon', 4.5, 83, 'c5555555-5555-5555-5555-555555555555', NOW());

-- Bohicon → Savè (Atlantique Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Bohicon', 'Savè', 1800, '["07:00", "10:00", "14:00", "17:00"]'::jsonb, 'Gare Bohicon', 4.2, 76, 'c6666666-6666-6666-6666-666666666666', NOW());

-- ─────────────────────────────────────────────────────────────────────────
-- TRAJETS RETOUR : AUTRES VILLES → COTONOU
-- ─────────────────────────────────────────────────────────────────────────

-- Abomey → Cotonou (TTB)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Abomey', 'Cotonou', 2500, '["06:00", "08:00", "10:00", "13:00", "15:00"]'::jsonb, 'Gare Abomey', 4.5, 134, 'c5555555-5555-5555-5555-555555555555', NOW());

-- Djougou → Cotonou (Songhai Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Djougou', 'Cotonou', 6000, '["05:00", "07:00", "14:00"]'::jsonb, 'Gare Djougou', 4.3, 79, 'c9999999-9999-9999-9999-999999999999', NOW());

-- Natitingou → Cotonou (Yeye Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Natitingou', 'Cotonou', 7000, '["05:00", "06:00", "14:00"]'::jsonb, 'Gare Natitingou', 4.4, 68, 'c7777777-7777-7777-7777-777777777777', NOW());

-- Kandi → Cotonou (Alibori Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Kandi', 'Cotonou', 7500, '["05:00", "13:00"]'::jsonb, 'Gare Kandi', 4.2, 48, 'cf666666-6666-6666-6666-666666666666', NOW());

-- Ouidah → Cotonou (African Pride)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Ouidah', 'Cotonou', 1000, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare Ouidah', 4.3, 193, 'ca111111-1111-1111-1111-111111111111', NOW());

-- Savalou → Cotonou (Bénin Évasion)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Savalou', 'Cotonou', 3000, '["06:00", "09:00", "14:00"]'::jsonb, 'Gare Savalou', 4.1, 61, 'cc333333-3333-3333-3333-333333333333', NOW());

-- Savè → Cotonou (Bénin Évasion)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Savè', 'Cotonou', 3500, '["06:00", "08:00", "10:00", "14:00"]'::jsonb, 'Gare Savè', 4.2, 87, 'cc333333-3333-3333-3333-333333333333', NOW());

-- Allada → Cotonou (Oueme Transport)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Allada', 'Cotonou', 1200, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare Allada', 4.1, 138, 'cd444444-4444-4444-4444-444444444444', NOW());

-- Grand-Popo → Cotonou (Mono Express)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Grand-Popo', 'Cotonou', 2500, '["06:00", "08:00", "11:00", "14:00", "16:00"]'::jsonb, 'Gare Grand-Popo', 4.0, 71, 'ce555555-5555-5555-5555-555555555555', NOW());

-- Malanville → Cotonou (Alibori Voyage)
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Malanville', 'Cotonou', 8000, '["05:00", "13:00"]'::jsonb, 'Gare Malanville', 4.1, 39, 'cf666666-6666-6666-6666-666666666666', NOW());
