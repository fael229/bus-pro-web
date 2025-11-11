-- ════════════════════════════════════════════════════════════════════════════
-- 🛣️ TRAJETS DES COMPAGNIES - PARTIE 1 (Cotonou vers autres villes)
-- ════════════════════════════════════════════════════════════════════════════

-- Cotonou → Parakou (Confort Lines) - 430km, 6h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Parakou', 5000, '["05:00", "07:00", "09:00", "13:00", "15:00", "18:00"]'::jsonb, 'Gare routière de Cotonou', 4.5, 127, 'c1111111-1111-1111-1111-111111111111', NOW());

-- Cotonou → Parakou (Benin Royal Tourism) - 430km, 6h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Parakou', 5500, '["06:00", "08:00", "10:00", "14:00", "16:00"]'::jsonb, 'Gare internationale', 4.7, 98, 'c2222222-2222-2222-2222-222222222222', NOW());

-- Cotonou → Porto-Novo (Confort Lines) - 40km, 1h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Porto-Novo', 800, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare routière', 4.2, 234, 'c1111111-1111-1111-1111-111111111111', NOW());

-- Cotonou → Abomey-Calavi (Baobab Voyage) - 15km, 30min
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Abomey-Calavi', 500, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Cadjèhoun', 4.0, 189, 'c3333333-3333-3333-3333-333333333333', NOW());

-- Cotonou → Bohicon (Confort Voyage) - 120km, 2h30
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Bohicon', 2000, '["05:30", "07:30", "09:30", "11:30", "14:00", "16:00", "18:00"]'::jsonb, 'Gare routière', 4.3, 156, 'c4444444-4444-4444-4444-444444444444', NOW());

-- Cotonou → Abomey (TTB) - 145km, 3h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Abomey', 2500, '["06:00", "08:00", "10:00", "13:00", "15:00", "17:00"]'::jsonb, 'Boulevard Marina', 4.6, 143, 'c5555555-5555-5555-5555-555555555555', NOW());

-- Cotonou → Djougou (Atlantique Voyage) - 450km, 7h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Djougou', 6000, '["05:00", "07:00", "14:00", "16:00"]'::jsonb, 'Gare routière', 4.4, 87, 'c6666666-6666-6666-6666-666666666666', NOW());

-- Cotonou → Natitingou (Yeye Transport) - 670km, 10h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Natitingou', 7000, '["05:00", "07:00", "15:00"]'::jsonb, 'Gare routière', 4.5, 76, 'c7777777-7777-7777-7777-777777777777', NOW());

-- Cotonou → Lokossa (Liberte Voyage) - 105km, 2h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Lokossa', 2000, '["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare routière', 4.1, 112, 'c8888888-8888-8888-8888-888888888888', NOW());

-- Cotonou → Kandi (Songhai Transport) - 586km, 9h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Kandi', 7500, '["05:00", "14:00"]'::jsonb, 'Gare routière', 4.3, 54, 'c9999999-9999-9999-9999-999999999999', NOW());

-- Cotonou → Ouidah (African Pride) - 42km, 1h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Ouidah', 1000, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Jonquet', 4.4, 201, 'ca111111-1111-1111-1111-111111111111', NOW());

-- Cotonou → Savalou (Express Borgou) - 245km, 4h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Savalou', 3000, '["06:00", "09:00", "13:00", "16:00"]'::jsonb, 'Gare routière', 4.2, 68, 'cb222222-2222-2222-2222-222222222222', NOW());

-- Cotonou → Savè (Bénin Évasion) - 210km, 3h30
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Savè', 3500, '["06:00", "08:00", "10:00", "13:00", "15:00"]'::jsonb, 'Étoile Rouge', 4.3, 92, 'cc333333-3333-3333-3333-333333333333', NOW());

-- Cotonou → Allada (Oueme Transport) - 55km, 1h15
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Allada', 1200, '["06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00"]'::jsonb, 'Gare routière', 4.0, 145, 'cd444444-4444-4444-4444-444444444444', NOW());

-- Cotonou → Grand-Popo (Mono Express) - 90km, 2h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Grand-Popo', 2500, '["07:00", "09:00", "12:00", "15:00", "17:00"]'::jsonb, 'Gare routière', 4.2, 78, 'ce555555-5555-5555-5555-555555555555', NOW());

-- Cotonou → Malanville (Alibori Voyage) - 730km, 11h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Malanville', 8000, '["05:00", "13:00"]'::jsonb, 'Gare routière', 4.1, 41, 'cf666666-6666-6666-6666-666666666666', NOW());

-- Cotonou → Dassa-Zoumè (Confort Lines) - 215km, 3h30
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Dassa-Zoumè', 3000, '["06:00", "08:00", "11:00", "14:00", "16:00"]'::jsonb, 'Gare routière', 4.4, 82, 'c1111111-1111-1111-1111-111111111111', NOW());

-- Cotonou → Nikki (Express Borgou) - 550km, 8h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Nikki', 6500, '["05:00", "14:00"]'::jsonb, 'Gare routière', 4.2, 47, 'cb222222-2222-2222-2222-222222222222', NOW());

-- Cotonou → Tchaourou (Benin Royal) - 340km, 5h
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Tchaourou', 4500, '["06:00", "08:00", "14:00"]'::jsonb, 'Gare internationale', 4.5, 65, 'c2222222-2222-2222-2222-222222222222', NOW());

-- Cotonou → Bassila (Songhai) - 410km, 6h30
INSERT INTO trajets (depart, arrivee, prix, horaires, gare, note, nb_avis, compagnie_id, created_at)
VALUES ('Cotonou', 'Bassila', 5500, '["06:00", "14:00"]'::jsonb, 'Gare routière', 4.3, 51, 'c9999999-9999-9999-9999-999999999999', NOW());
