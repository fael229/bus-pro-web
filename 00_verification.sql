-- ════════════════════════════════════════════════════════════════════════════
-- 🔍 REQUÊTES DE VÉRIFICATION ET STATISTIQUES
-- ════════════════════════════════════════════════════════════════════════════
-- Utilisez ces requêtes pour vérifier l'import et explorer les données
-- ════════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ VÉRIFICATIONS DE BASE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Nombre total de compagnies (devrait être 15)
SELECT COUNT(*) as total_compagnies FROM compagnies;

-- 2. Nombre total de trajets (devrait être 60)
SELECT COUNT(*) as total_trajets FROM trajets;

-- 3. Liste des compagnies
SELECT nom, telephone, adresse FROM compagnies ORDER BY nom;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 STATISTIQUES PAR COMPAGNIE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trajets par compagnie avec prix moyen
SELECT 
  c.nom as compagnie,
  COUNT(t.id) as nb_trajets,
  ROUND(AVG(t.prix)) as prix_moyen,
  MIN(t.prix) as prix_min,
  MAX(t.prix) as prix_max
FROM compagnies c
LEFT JOIN trajets t ON t.compagnie_id = c.id
GROUP BY c.nom
ORDER BY nb_trajets DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🗺️ STATISTIQUES PAR VILLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trajets depuis Cotonou
SELECT 
  arrivee as destination,
  COUNT(*) as nb_compagnies,
  MIN(prix) as prix_min,
  MAX(prix) as prix_max
FROM trajets
WHERE depart = 'Cotonou'
GROUP BY arrivee
ORDER BY nb_compagnies DESC, prix_min;

-- Trajets vers Cotonou
SELECT 
  depart as origine,
  COUNT(*) as nb_compagnies,
  MIN(prix) as prix_min,
  MAX(prix) as prix_max
FROM trajets
WHERE arrivee = 'Cotonou'
GROUP BY depart
ORDER BY nb_compagnies DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 💰 ANALYSE DES PRIX
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Top 10 des trajets les plus chers
SELECT 
  depart,
  arrivee,
  prix as prix_fcfa,
  c.nom as compagnie
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
ORDER BY prix DESC
LIMIT 10;

-- Top 10 des trajets les moins chers
SELECT 
  depart,
  arrivee,
  prix as prix_fcfa,
  c.nom as compagnie
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
ORDER BY prix ASC
LIMIT 10;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⏰ ANALYSE DES HORAIRES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trajets avec le plus de départs par jour
SELECT 
  depart,
  arrivee,
  c.nom as compagnie,
  jsonb_array_length(horaires) as nb_departs
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
ORDER BY nb_departs DESC
LIMIT 10;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ⭐ ANALYSE DES NOTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trajets les mieux notés
SELECT 
  depart,
  arrivee,
  c.nom as compagnie,
  note,
  nb_avis
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
ORDER BY note DESC, nb_avis DESC
LIMIT 10;

-- Note moyenne par compagnie
SELECT 
  c.nom as compagnie,
  ROUND(AVG(t.note), 2) as note_moyenne,
  SUM(t.nb_avis) as total_avis
FROM compagnies c
LEFT JOIN trajets t ON t.compagnie_id = c.id
GROUP BY c.nom
ORDER BY note_moyenne DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔎 RECHERCHES UTILES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Tous les trajets Cotonou → Parakou (comparaison)
SELECT 
  c.nom as compagnie,
  prix,
  horaires,
  note,
  nb_avis
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
WHERE depart = 'Cotonou' AND arrivee = 'Parakou'
ORDER BY prix;

-- Trajets depuis une ville spécifique (remplacer 'Parakou')
SELECT 
  arrivee as destination,
  c.nom as compagnie,
  prix,
  jsonb_array_length(horaires) as nb_departs,
  note
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
WHERE depart = 'Parakou'
ORDER BY arrivee;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📍 COUVERTURE GÉOGRAPHIQUE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Toutes les villes desservies (départ)
SELECT DISTINCT depart as ville
FROM trajets
ORDER BY depart;

-- Toutes les villes desservies (arrivée)
SELECT DISTINCT arrivee as ville
FROM trajets
ORDER BY arrivee;

-- Paires de villes connectées (unique)
SELECT DISTINCT
  LEAST(depart, arrivee) as ville1,
  GREATEST(depart, arrivee) as ville2,
  COUNT(*) as nb_compagnies
FROM trajets
GROUP BY ville1, ville2
ORDER BY nb_compagnies DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🧪 TEST DE COHÉRENCE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Vérifier qu'il n'y a pas de trajets orphelins
SELECT COUNT(*) as trajets_sans_compagnie
FROM trajets t
LEFT JOIN compagnies c ON t.compagnie_id = c.id
WHERE c.id IS NULL;

-- Vérifier les prix anormaux (< 100 ou > 10000)
SELECT depart, arrivee, prix, c.nom
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
WHERE prix < 100 OR prix > 10000;

-- Vérifier les horaires vides
SELECT depart, arrivee, c.nom
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
WHERE horaires IS NULL OR jsonb_array_length(horaires) = 0;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🎯 RÉSUMÉ COMPLET
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  'RÉSUMÉ COMPLET' as info,
  (SELECT COUNT(*) FROM compagnies) as total_compagnies,
  (SELECT COUNT(*) FROM trajets) as total_trajets,
  (SELECT COUNT(DISTINCT depart) FROM trajets) as villes_depart,
  (SELECT COUNT(DISTINCT arrivee) FROM trajets) as villes_arrivee,
  (SELECT MIN(prix) FROM trajets) as prix_min,
  (SELECT MAX(prix) FROM trajets) as prix_max,
  (SELECT ROUND(AVG(prix)) FROM trajets) as prix_moyen,
  (SELECT ROUND(AVG(note), 2) FROM trajets) as note_moyenne;
