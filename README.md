# SSS-ATTRIBUTIONS

Application de gestion des cours vacants et attributions pour UCLouvain.

## 📋 Description

Cette application permet de :
- Importer des données de cours vacants depuis des fichiers Excel
- Gérer les attributions d'enseignants aux cours
- Visualiser et modifier les informations des cours
- Valider les volumes d'attribution
- Suivre l'historique des modifications

## ✨ Fonctionnalités

### Import Excel
- **Mapping des colonnes** : Interface intuitive pour lier les colonnes Excel aux champs de l'application
- **Détection automatique** : Détection intelligente des colonnes avec possibilité d'ajustement manuel
- **Gestion "Non Attr."** : Traitement automatique des lignes "Non Attr." comme attributions vacantes
- **Validation des volumes** : Contrôle automatique que la somme des attributions correspond aux volumes totaux

### Gestion des cours
- **Affichage moderne** : Interface utilisateur moderne et ergonomique
- **Mode édition sécurisé** : Les champs ne sont éditables qu'après activation du mode édition
- **Historique des modifications** : Suivi complet des changements effectués sur chaque cours
- **Tableau des membres** : Affichage détaillé de tous les membres attribués à un cours

## 🚀 Démarrage rapide

### Prérequis
- Python 3.x (pour le serveur local)
- Un compte Supabase configuré

### Installation

1. Clonez le repository :
```bash
git clone https://github.com/rdgdeg/SSS-ATTRIBUTIONS.git
cd SSS-ATTRIBUTIONS
```

2. Configurez Supabase :
   - Créez un projet Supabase
   - Exécutez les scripts SQL dans l'ordre :
     - `supabase-cours-vacants-sql.sql`
     - `supabase-create-history-table.sql`
     - `supabase-create-attributions-table.sql`
     - `supabase-add-all-excel-columns.sql` (si nécessaire)

3. Mettez à jour les clés Supabase dans les fichiers :
   - `import-cours-vacants.tsx`
   - `cours-vacants-view.tsx`
   - `app-cours-vacants-complete.html`
   - `app-gestion-cours-vacants.html`

### Lancement en local

1. Démarrez le serveur HTTP :
```bash
python server.py
```

2. Ouvrez votre navigateur à : `http://localhost:8000`

3. Accédez à l'application :
   - `app-cours-vacants-complete.html` - Application complète
   - `app-gestion-cours-vacants.html` - Gestion complète
   - `index-standalone.html` - Version standalone

## 📁 Structure du projet

```
SSS-ATTRIBUTIONS/
├── import-cours-vacants.tsx          # Composant d'import Excel
├── cours-vacants-view.tsx            # Vue des cours vacants
├── cours-attributions-app.tsx        # Application principale des attributions
├── import-excel-component.tsx        # Composant d'import Excel (ancien)
├── app-cours-vacants-complete.html  # Application HTML complète
├── app-gestion-cours-vacants.html    # Application HTML de gestion
├── index-standalone.html             # Version standalone
├── server.py                         # Serveur HTTP local
├── supabase-*.sql                    # Scripts SQL pour Supabase
└── GUIDE-*.md                        # Guides de dépannage
```

## 📚 Documentation

- [GUIDE-DEPANNAGE-IMPORT.md](GUIDE-DEPANNAGE-IMPORT.md) - Guide de dépannage pour l'import
- [GUIDE-DEPANNAGE-VOLUMES.md](GUIDE-DEPANNAGE-VOLUMES.md) - Guide de dépannage pour les volumes
- [README-COURS-VACANTS.md](README-COURS-VACANTS.md) - Documentation des cours vacants
- [guide-integration-supabase.md](guide-integration-supabase.md) - Guide d'intégration Supabase

## 🔧 Technologies utilisées

- **React** - Framework UI
- **Tailwind CSS** - Framework CSS
- **Supabase** - Backend (PostgreSQL)
- **XLSX.js** - Lecture de fichiers Excel
- **Lucide React** - Icônes

## 📝 Format Excel attendu

L'application attend un fichier Excel avec les colonnes suivantes (peut être mappé manuellement) :

### Colonnes principales
- `Cours` - Code du cours
- `Intitulé abrégé` - Intitulé court
- `Intit.Complet` - Intitulé complet
- `Volume 1 total` - Volume total 1
- `Volume 2 total` - Volume total 2

### Colonnes d'attribution
- `Nom` - Nom de l'enseignant
- `Prénom` - Prénom de l'enseignant
- `Fonction` - Fonction (Coordinateur, Cotitulaire, etc.)
- `Vol1. Attribution` - Volume 1 attribué
- `Vol2. Attribution` - Volume 2 attribué
- `Début` - Année de début
- `Durée` - Durée en années
- `Email UCL` - Email UCL

**Note** : "Non Attr." dans les colonnes Nom/Prénom est automatiquement traité comme une attribution vacante.

## 🐛 Dépannage

Consultez les guides de dépannage pour résoudre les problèmes courants :
- Problèmes d'import : [GUIDE-DEPANNAGE-IMPORT.md](GUIDE-DEPANNAGE-IMPORT.md)
- Problèmes de volumes : [GUIDE-DEPANNAGE-VOLUMES.md](GUIDE-DEPANNAGE-VOLUMES.md)

## 📄 Licence

Ce projet est destiné à un usage interne pour UCLouvain.

## 👤 Auteur

**rdgdeg**

## 🙏 Remerciements

- UCLouvain pour le support
- L'équipe Supabase pour l'infrastructure
