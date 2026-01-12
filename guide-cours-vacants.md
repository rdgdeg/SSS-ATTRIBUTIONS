# 📋 Guide d'utilisation - Module Cours Vacants

## Vue d'ensemble

Ce module permet de gérer spécifiquement les cours vacants avec un import Excel détaillé et une vue dédiée pour leur suivi.

## 🗄️ Étape 1 : Configuration Supabase

### 1.1 Créer la table dans Supabase

1. Allez sur votre projet Supabase : https://dhuuduphwvxrecfqvbbw.supabase.co
2. Ouvrez le **SQL Editor**
3. Copiez et exécutez le contenu du fichier `supabase-cours-vacants-sql.sql`
4. Vérifiez que la table `cours_vacants` a été créée dans **Table Editor**

### 1.2 Vérifier les politiques RLS

Les politiques par défaut permettent :
- ✅ Lecture publique (tous les utilisateurs)
- ✅ Insertion (tous les utilisateurs)
- ✅ Mise à jour (tous les utilisateurs)

Pour restreindre l'accès, modifiez les politiques dans Supabase.

## 📥 Étape 2 : Import des données

### 2.1 Préparer votre fichier Excel

Votre fichier Excel doit contenir les colonnes suivantes (les noms peuvent varier légèrement) :

**Colonnes principales :**
- `Sigle` - Sigle du cours
- `Cnum` - Numéro de cours
- `Cours` - Code du cours (obligatoire)
- `Intitulé` / `Intitul` - Intitulé complet
- `Intitulé Court` / `Intit.C` - Intitulé abrégé
- `Inactif` - Statut inactif (true/false)
- `Etat validation` / `Etat va` - État de validation

**Volumes et coefficients :**
- `Vol1.` / `Vol1` - Volume 1
- `Vol2.` / `Vol2` - Volume 2
- `Coef1` - Coefficient 1
- `Coef2` - Coefficient 2
- `Volume` - Volume total

**Départements et périodicité :**
- `Dpt Client` / `Dpt Cl` - Département client
- `Dpt Attribution` / `Dpt At` - Département d'attribution
- `Type` - Type de cours
- `Périodicité` / `Périod` - Périodicité

**Informations personne :**
- `Nom` - Nom de famille
- `Prénom` / `Prénor` - Prénom
- `Matricule` / `Matric` - Numéro de matricule
- `Date naissance` / `Date n` - Date de naissance
- `Email` - Adresse email
- `Fonction` / `Foncti` - Fonction
- `Supplément` / `Supplé` - Supplément

**Attribution :**
- `Début` - Année de début
- `Durée` - Durée en années
- `Vol1 enseignant` - Volume 1 enseignant
- `Vol2 enseignant` - Volume 2 enseignant
- `Mode paiement` / `Mode pal` - Mode de paiement
- `Poste` - Poste

**Remarques et autres :**
- `Remarque` / `Remarqu` - Remarque générale
- `Remarque spéciale` / `Rem. spe` - Remarque spéciale
- `Procédure` / `Procédur` - Procédure
- `Id équipe` / `Id équipi` - Identifiant équipe
- `Candidat` - Informations candidat

**Causes (plusieurs colonnes possibles) :**
- `Cause` - Cause 1, 2, 3, 4 (selon les colonnes présentes)

### 2.2 Importer via l'interface web

1. Accédez à la page d'import : `/import-cours-vacants`
2. Cliquez sur "Sélectionner un fichier"
3. Choisissez votre fichier Excel (.xlsx)
4. Vérifiez l'aperçu du fichier
5. Cliquez sur "Importer"
6. Attendez la fin de l'import (barre de progression)
7. Consultez les résultats (cours créés, mis à jour, erreurs)

### 2.3 Gestion des erreurs

Si des erreurs surviennent :
- ✅ Vérifiez que le fichier est bien au format .xlsx
- ✅ Vérifiez que la colonne "Cours" existe et contient des valeurs
- ✅ Consultez les messages d'erreur détaillés dans l'interface
- ✅ Vérifiez les logs dans la console du navigateur

## 👀 Étape 3 : Visualisation des cours vacants

### 3.1 Accéder à la vue

Accédez à la page : `/cours-vacants`

### 3.2 Fonctionnalités disponibles

**Statistiques :**
- Total des cours vacants
- Nombre avec candidat
- Nombre sans candidat
- Nombre inactifs

**Recherche et filtres :**
- 🔍 Recherche par : code, intitulé, nom, prénom, matricule
- 🏢 Filtre par département
- 📊 Filtre par état de validation

**Affichage :**
- Liste des cours avec informations principales
- Clic sur un cours pour voir les détails complets
- Badges visuels pour : Inactif, Candidat, État validation

**Détails affichés :**
- Informations du cours (volumes, coefficients, périodicité)
- Informations personne (nom, prénom, email, matricule)
- Attribution (début, durée, volumes enseignant)
- Remarques et procédures
- Causes (si présentes)
- Candidat (si présent)

## 🔧 Étape 4 : Intégration dans votre application

### 4.1 Structure des fichiers

```
votre-projet/
├── import-cours-vacants.tsx      # Composant d'import
├── cours-vacants-view.tsx        # Vue de visualisation
├── supabase-cours-vacants-sql.sql # Script SQL
└── guide-cours-vacants.md        # Ce guide
```

### 4.2 Intégration avec Next.js

**Option A : Pages Router**

Créez les fichiers suivants :
- `pages/import-cours-vacants.tsx` → Copiez `import-cours-vacants.tsx`
- `pages/cours-vacants.tsx` → Copiez `cours-vacants-view.tsx`

**Option B : App Router**

Créez les fichiers suivants :
- `app/import-cours-vacants/page.tsx` → Copiez `import-cours-vacants.tsx`
- `app/cours-vacants/page.tsx` → Copiez `cours-vacants-view.tsx`

### 4.3 Ajouter un lien dans le menu principal

Dans votre composant principal (`cours-attributions-app.tsx`), ajoutez :

```tsx
<button
  onClick={() => window.location.href = '/cours-vacants'}
  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium"
>
  <AlertTriangle className="w-4 h-4 inline mr-2" />
  Cours Vacants
</button>
```

## 📊 Étape 5 : Utilisation avancée

### 5.1 Mise à jour des données

Pour mettre à jour les données :
1. Modifiez votre fichier Excel
2. Réimportez via l'interface
3. Les cours existants seront automatiquement mis à jour (basé sur `code_cours`)

### 5.2 Requêtes Supabase personnalisées

Vous pouvez interroger directement la table `cours_vacants` :

```javascript
// Récupérer tous les cours vacants avec candidat
const { data } = await supabase
  .from('cours_vacants')
  .select('*')
  .not('candidat', 'is', null);

// Récupérer les cours vacants d'un département
const { data } = await supabase
  .from('cours_vacants')
  .select('*')
  .eq('dpt_attribution', 'VOTRE_DEPARTEMENT');

// Compter les cours vacants par département
const { data } = await supabase
  .from('cours_vacants')
  .select('dpt_attribution')
  .group('dpt_attribution');
```

### 5.3 Export des données

Pour exporter les données depuis Supabase :
1. Allez dans **Table Editor** > `cours_vacants`
2. Cliquez sur les trois points (⋮)
3. Sélectionnez "Export" > "CSV"

## 🐛 Dépannage

### Problème : L'import échoue

**Solutions :**
- Vérifiez que la table `cours_vacants` existe dans Supabase
- Vérifiez que les politiques RLS permettent l'insertion
- Vérifiez les clés Supabase dans le code
- Consultez les erreurs détaillées dans l'interface

### Problème : Les colonnes ne sont pas reconnues

**Solutions :**
- Vérifiez les noms exacts des colonnes dans votre Excel
- Le composant essaie plusieurs variantes de noms
- Vous pouvez modifier le mapping dans `import-cours-vacants.tsx` si nécessaire

### Problème : Les données ne s'affichent pas

**Solutions :**
- Vérifiez que l'import s'est bien terminé
- Vérifiez les politiques RLS pour la lecture
- Actualisez la page (`F5`)
- Vérifiez la console du navigateur pour les erreurs

## 📝 Notes importantes

1. **Code cours unique** : Le champ `code_cours` est utilisé comme identifiant unique. Si vous réimportez un cours avec le même code, il sera mis à jour.

2. **Mapping flexible** : Le composant d'import essaie de reconnaître plusieurs variantes de noms de colonnes. Si certaines colonnes ne sont pas reconnues, vous pouvez ajuster le mapping dans le code.

3. **Performance** : Pour de gros fichiers (>1000 lignes), l'import peut prendre quelques minutes. La barre de progression vous indique l'avancement.

4. **Sécurité** : Par défaut, les données sont accessibles en lecture publique. Pour restreindre l'accès, modifiez les politiques RLS dans Supabase.

## 🎯 Prochaines étapes possibles

- ✅ Ajouter des filtres supplémentaires (par date, par volume, etc.)
- ✅ Ajouter l'export Excel des cours vacants
- ✅ Ajouter des graphiques et statistiques avancées
- ✅ Ajouter la possibilité d'éditer les cours directement dans l'interface
- ✅ Ajouter un système de notifications pour les nouveaux cours vacants

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs dans la console du navigateur
2. Vérifiez les erreurs dans Supabase (Logs > Postgres Logs)
3. Vérifiez que toutes les étapes de configuration ont été suivies
