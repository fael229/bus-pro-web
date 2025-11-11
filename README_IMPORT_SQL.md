# 🚌 Import des Compagnies et Trajets du Bénin dans Supabase

## 📋 Fichiers SQL créés

1. **01_compagnies_benin.sql** - 15 compagnies de transport
2. **02_trajets_benin_partie1.sql** - 20 trajets depuis Cotonou
3. **03_trajets_benin_partie2.sql** - 30 trajets retour et inter-villes
4. **04_trajets_benin_partie3.sql** - 10 trajets inter-villes supplémentaires
5. **05_destinations_benin.sql** - 26 destinations (villes)

**Total : 15 compagnies + 60 trajets + 26 destinations**

---

## 🏢 Compagnies incluses

1. **Confort Lines** - Cotonou
2. **Benin Royal Tourism** - Cotonou  
3. **Baobab Voyage** - Cotonou
4. **Confort Voyage** - Parakou
5. **Transport Touristique du Bénin** - Cotonou
6. **Atlantique Voyage** - Bohicon
7. **Yèyé Transport** - Porto-Novo
8. **Liberté Voyage** - Abomey-Calavi
9. **Songhai Transport** - Djougou
10. **African Pride Transport** - Cotonou
11. **Express du Borgou** - Parakou
12. **Bénin Évasion** - Cotonou
13. **Ouémé Transport** - Porto-Novo
14. **Mono Express** - Lokossa
15. **Alibori Voyage** - Kandi

---

## 🗺️ Principales routes couvertes

### Routes Nord-Sud
- **Cotonou ↔ Parakou** (430km) - 5000-5500 FCFA
- **Cotonou ↔ Natitingou** (670km) - 7000 FCFA
- **Cotonou ↔ Djougou** (450km) - 6000 FCFA
- **Cotonou ↔ Kandi** (586km) - 7500 FCFA
- **Cotonou ↔ Malanville** (730km) - 8000 FCFA

### Routes Centre
- **Cotonou ↔ Bohicon** (120km) - 2000 FCFA
- **Cotonou ↔ Abomey** (145km) - 2500 FCFA
- **Cotonou ↔ Savè** (210km) - 3500 FCFA
- **Cotonou ↔ Dassa-Zoumè** (215km) - 3000 FCFA

### Routes Sud
- **Cotonou ↔ Porto-Novo** (40km) - 800 FCFA
- **Cotonou ↔ Ouidah** (42km) - 1000 FCFA
- **Cotonou ↔ Lokossa** (105km) - 2000 FCFA
- **Cotonou ↔ Grand-Popo** (90km) - 2500 FCFA

### Routes Inter-villes
- **Parakou ↔ Natitingou** - 2500 FCFA
- **Parakou ↔ Djougou** - 2000 FCFA
- **Kandi ↔ Malanville** - 1500 FCFA

---

## 📥 Comment importer dans Supabase

### Méthode 1 : Via l'interface Supabase (recommandée)

1. Allez sur **supabase.com** et connectez-vous
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu gauche)
4. Créez une nouvelle requête
5. Copiez-collez le contenu de chaque fichier **dans l'ordre** :
   - `01_compagnies_benin.sql`
   - `05_destinations_benin.sql` ⭐ **NOUVEAU**
   - `02_trajets_benin_partie1.sql`
   - `03_trajets_benin_partie2.sql`
   - `04_trajets_benin_partie3.sql`
6. Cliquez sur **Run** pour chaque fichier

### Méthode 2 : En une seule commande

Combinez tous les fichiers et exécutez-les en une seule fois :

```sql
-- Exécuter dans cet ordre exact
\i 01_compagnies_benin.sql
\i 05_destinations_benin.sql
\i 02_trajets_benin_partie1.sql
\i 03_trajets_benin_partie2.sql
\i 04_trajets_benin_partie3.sql
```

---

## ✅ Vérification après import

Exécutez ces requêtes pour vérifier :

```sql
-- Nombre de compagnies (devrait être 15)
SELECT COUNT(*) FROM compagnies;

-- Nombre de destinations (devrait être 26)
SELECT COUNT(*) FROM destinations;

-- Nombre de trajets (devrait être 60)
SELECT COUNT(*) FROM trajets;

-- Liste des destinations
SELECT * FROM destinations ORDER BY nom;

-- Trajets par compagnie
SELECT c.nom, COUNT(t.id) as nb_trajets
FROM compagnies c
LEFT JOIN trajets t ON t.compagnie_id = c.id
GROUP BY c.nom
ORDER BY nb_trajets DESC;

-- Trajets depuis Cotonou
SELECT depart, arrivee, prix, c.nom as compagnie
FROM trajets t
JOIN compagnies c ON t.compagnie_id = c.id
WHERE depart = 'Cotonou'
ORDER BY prix;
```

---

## 🔄 Réinitialiser (si nécessaire)

Si vous voulez supprimer et recommencer :

```sql
-- ⚠️ ATTENTION : Supprime toutes les données !
DELETE FROM trajets WHERE compagnie_id IN (
  SELECT id FROM compagnies 
  WHERE id LIKE 'c%' OR id LIKE 't%'
);
DELETE FROM compagnies WHERE id LIKE 'c%';
```

---

## 📊 Statistiques des données

- **15 compagnies** réparties dans tout le Bénin
- **26 destinations** (villes) couvrant tout le pays
- **60 trajets** couvrant les principales routes
- **Prix** : de 500 FCFA (courte distance) à 8000 FCFA (longue distance)
- **Horaires** : multiples départs par jour selon les routes
- **Notes** : entre 4.0 et 4.7/5
- **Avis** : entre 39 et 234 avis par trajet

---

## 🎯 Couverture géographique

### Villes du Nord
- Malanville, Kandi, Parakou, Djougou, Natitingou, Bassila, Nikki

### Villes du Centre  
- Savè, Dassa-Zoumè, Savalou, Tchaourou, Bohicon, Abomey

### Villes du Sud
- Cotonou, Porto-Novo, Ouidah, Lokossa, Grand-Popo, Allada, Abomey-Calavi, Pobè, Sakété

---

## 💡 Notes importantes

1. **IDs uniques** : Chaque compagnie et trajet a un UUID unique
2. **Format horaires** : JSONB array `["05:00", "07:00", ...]`
3. **Prix en FCFA** : Montants réalistes basés sur les distances
4. **Téléphones** : Format `+229 XX XX XX XX`
5. **Gares** : Adresses réelles des gares routières

---

## 🚀 Prochaines étapes

Après l'import, vous pouvez :

1. ✅ Tester la recherche de trajets sur votre app
2. ✅ Vérifier l'affichage des compagnies
3. ✅ Ajouter des logos pour les compagnies (logo_url)
4. ✅ Créer des réservations test
5. ✅ Ajouter des avis clients

---

## 📞 Support

Si vous rencontrez des erreurs lors de l'import :
- Vérifiez que les tables `compagnies` et `trajets` existent
- Vérifiez les contraintes de clés étrangères
- Assurez-vous que les UUID sont uniques

Bon import ! 🚌✨
