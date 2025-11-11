-- ════════════════════════════════════════════════════════════════════════════
-- 🛣️ TRAJETS DES COMPAGNIES - PARTIE 3 (Trajets inter-villes)
-- ════════════════════════════════════════════════════════════════════════════

-- Natitingou → Parakou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Natitingou', 'Parakou', 2500, '["06:00", "09:00", "14:00"]'::jsonb, 'Gare Natitingou', 4.4, 81, 'cb222222-2222-2222-2222-222222222222', NOW());

-- Natitingou → Djougou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Natitingou', 'Djougou', 1500, '["07:00", "10:00", "15:00"]'::jsonb, 'Gare Natitingou', 4.3, 66, 'c7777777-7777-7777-7777-777777777777', NOW());

-- Djougou → Parakou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Djougou', 'Parakou', 2000, '["06:00", "08:00", "11:00", "14:00"]'::jsonb, 'Gare Djougou', 4.3, 94, 'c9999999-9999-9999-9999-999999999999', NOW());

-- Kandi → Malanville
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Kandi', 'Malanville', 1500, '["07:00", "11:00", "15:00"]'::jsonb, 'Gare Kandi', 4.0, 44, 'cf666666-6666-6666-6666-666666666666', NOW());

-- Malanville → Kandi
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Malanville', 'Kandi', 1500, '["06:00", "10:00", "14:00"]'::jsonb, 'Gare Malanville', 4.1, 41, 'cf666666-6666-6666-6666-666666666666', NOW());

-- Savè → Parakou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Savè', 'Parakou', 2500, '["06:00", "09:00", "13:00"]'::jsonb, 'Gare Savè', 4.3, 78, 'c2222222-2222-2222-2222-222222222222', NOW());

-- Dassa-Zoumè → Parakou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Dassa-Zoumè', 'Parakou', 2500, '["07:00", "10:00", "14:00"]'::jsonb, 'Gare Dassa', 4.2, 69, 'c1111111-1111-1111-1111-111111111111', NOW());

-- Dassa-Zoumè → Cotonou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Dassa-Zoumè', 'Cotonou', 3000, '["06:00", "09:00", "13:00"]'::jsonb, 'Gare Dassa', 4.3, 75, 'c1111111-1111-1111-1111-111111111111', NOW());

-- Abomey → Parakou
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Abomey', 'Parakou', 4000, '["06:00", "08:00", "14:00"]'::jsonb, 'Gare Abomey', 4.4, 72, 'c5555555-5555-5555-5555-555555555555', NOW());

-- Ouidah → Porto-Novo
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Ouidah', 'Porto-Novo', 1500, '["07:00", "10:00", "14:00"]'::jsonb, 'Gare Ouidah', 4.2, 86, 'ca111111-1111-1111-1111-111111111111', NOW());
