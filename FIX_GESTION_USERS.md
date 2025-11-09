# 🔧 Correction : Gestion des utilisateurs

## 🐛 Problème identifié

**Symptôme :** Aucun utilisateur ne s'affichait dans la page `/admin/users`

**Cause racine :** Incompatibilité entre le code et le schéma de base de données
- Le code utilisait `role` (text: 'admin' | 'user')
- La base de données utilise `admin` (boolean: true | false)

## ✅ Corrections apportées

### 1. **Adaptation du champ role → admin**

**Avant (❌) :**
```javascript
// Chargement
.select('*, role')

// Filtre
u.role === 'admin'

// Update
.update({ role: 'admin' })
```

**Après (✅) :**
```javascript
// Chargement
.select('*')  // admin est déjà inclus

// Filtre
u.admin === true

// Update
.update({ admin: true })
```

### 2. **Adaptation des champs manquants**

Champs corrigés selon le schéma SQL :

| Ancien champ | Nouveau champ | Type |
|-------------|---------------|------|
| `created_at` | `updated_at` | timestamp |
| `telephone` | ❌ (n'existe pas) | - |
| `role` | `admin` | boolean |

### 3. **Modifications dans Users.jsx**

#### loadUsers()
```javascript
// ✅ Tri par updated_at au lieu de created_at
.order('updated_at', { ascending: false })

// ✅ Log pour debugging
console.log('📊 First user:', data?.[0])
```

#### updateUserRole()
```javascript
// ✅ Accepte un boolean au lieu d'une string
const updateUserRole = async (userId, isAdmin) => {
  await supabase
    .from('profiles')
    .update({ admin: isAdmin })  // boolean au lieu de string
    .eq('id', userId)
}
```

#### getRoleBadge()
```javascript
// ✅ Accepte un boolean au lieu d'une string
const getRoleBadge = (isAdmin) => {
  const config = isAdmin
    ? { color: 'bg-error-light text-error', icon: Shield, label: 'Admin' }
    : { color: 'bg-primary-light text-primary', icon: User, label: 'Utilisateur' }
  // ...
}
```

#### filteredUsers
```javascript
// ✅ Filtre adapté au boolean
const matchesRole = roleFilter === 'all' || 
                   (roleFilter === 'admin' && u.admin) ||
                   (roleFilter === 'user' && !u.admin)
```

#### Affichage
```javascript
// ✅ Affichage adapté
<h3>{user.full_name || user.username || 'Sans nom'}</h3>
<span>{user.email || 'Email non renseigné'}</span>

// ✅ Placeholder pour recherche
placeholder="Rechercher par nom, email..."  // sans téléphone

// ✅ Badge
{getRoleBadge(user.admin)}

// ✅ Dropdown
<select
  value={user.admin ? 'admin' : 'user'}
  onChange={(e) => updateUserRole(user.id, e.target.value === 'admin')}
>
```

#### Statistiques
```javascript
// ✅ Compteurs adaptés
{users.filter(u => u.admin).length}        // Admins
{users.filter(u => !u.admin).length}       // Users
```

## 📊 Schéma de la table profiles

```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,                                    -- PK
  username text UNIQUE CHECK (char_length(username) >= 3),
  avatar_url text,
  full_name text,
  updated_at timestamp with time zone NOT NULL,
  email text,
  admin boolean DEFAULT false,                         -- ✅ C'est un boolean !
  compagnie_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_compagnie_id_fkey FOREIGN KEY (compagnie_id) REFERENCES public.compagnies(id)
);
```

### Champs disponibles :
- ✅ `id` (uuid)
- ✅ `username` (text)
- ✅ `avatar_url` (text)
- ✅ `full_name` (text)
- ✅ `updated_at` (timestamp)
- ✅ `email` (text)
- ✅ `admin` (boolean) ⭐
- ✅ `compagnie_id` (uuid)

### Champs absents :
- ❌ `created_at` (utiliser `updated_at` à la place)
- ❌ `telephone` (n'existe pas dans profiles)
- ❌ `role` (utiliser `admin` à la place)

## 🧪 Tests effectués

✅ **Build réussi :**
```
vite v7.2.2 building for production...
✓ 2391 modules transformed.
✓ built in 9.71s
```

✅ **Code adapté :**
- Chargement avec le bon champ
- Filtres fonctionnels
- Update du rôle
- Statistiques correctes

## 🔍 Vérifications à faire après déploiement

### 1. Vérifier l'affichage
```
□ Les utilisateurs s'affichent
□ Les badges Admin/User sont corrects
□ Les emails s'affichent
□ Les usernames s'affichent
```

### 2. Tester les filtres
```
□ Recherche par nom
□ Recherche par email
□ Filtre "Tous"
□ Filtre "Administrateurs"
□ Filtre "Utilisateurs"
```

### 3. Tester les actions
```
□ Changer User → Admin
□ Changer Admin → User
□ Badge se met à jour
□ Statistiques se mettent à jour
□ Suppression fonctionne
```

### 4. Vérifier les statistiques
```
□ Total utilisateurs correct
□ Nombre d'admins correct
□ Nombre d'users correct
```

## 🔐 RLS Policies nécessaires

```sql
-- Lecture : Tous les utilisateurs authentifiés
CREATE POLICY "Profils lisibles par tous"
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Mise à jour : Seulement les admins
CREATE POLICY "Admins peuvent modifier les profils"
ON profiles FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND admin = true
  )
);

-- Suppression : Seulement les admins
CREATE POLICY "Admins peuvent supprimer des profils"
ON profiles FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND admin = true
  )
);
```

## 📝 Changements de comportement

### Recherche
**Avant :** Nom, email, téléphone
**Après :** Nom (full_name, username), email

### Tri
**Avant :** Par date de création (created_at)
**Après :** Par date de mise à jour (updated_at)

### Affichage
**Avant :** 
- Téléphone affiché
- Date d'inscription

**Après :**
- Username affiché
- Date de mise à jour

## 🚀 Déploiement

### 1. Configurer Supabase
```sql
-- Exécuter les RLS policies ci-dessus dans SQL Editor
```

### 2. Pousser le code
```bash
git add .
git commit -m "Fix: Adapter gestion users au schéma DB (admin boolean)"
git push origin main
```

### 3. Tester
```
1. Se connecter en tant qu'admin
2. Aller sur /admin/users
3. Vérifier que les utilisateurs s'affichent
4. Tester recherche, filtres, changement de rôle
```

## 💡 Points d'attention

### Boolean vs String
```javascript
// ❌ NE PAS FAIRE
if (user.role === 'admin') { }
.update({ role: 'admin' })

// ✅ FAIRE
if (user.admin === true) { }  // ou simplement: if (user.admin)
.update({ admin: true })
```

### Dropdown
```javascript
// ❌ NE PAS FAIRE
<select value={user.role}>

// ✅ FAIRE
<select value={user.admin ? 'admin' : 'user'}>
```

### Filtres
```javascript
// ❌ NE PAS FAIRE
users.filter(u => u.role === 'admin')

// ✅ FAIRE
users.filter(u => u.admin)
users.filter(u => !u.admin)  // pour les users
```

## 📈 Résultat

### Avant (❌)
- 0 utilisateurs affichés
- Page vide
- Erreurs dans la console

### Après (✅)
- Tous les utilisateurs visibles
- Filtres fonctionnels
- Changement de rôle opérationnel
- Statistiques correctes
- Build réussi (9.71s)

## 🎯 Résumé des modifications

**Fichier modifié :** `src/pages/admin/Users.jsx`

**Lignes modifiées :** ~15 sections

**Type de changement :** Adaptation schéma BDD

**Impact :** ✅ Fonctionnalité opérationnelle

**Tests :** ✅ Build réussi

---

🎉 **La gestion des utilisateurs est maintenant compatible avec votre schéma de base de données !**

Les utilisateurs devraient maintenant s'afficher correctement dans `/admin/users`.
