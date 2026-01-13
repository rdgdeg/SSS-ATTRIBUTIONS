# SSS-ATTRIBUTIONS

Application de gestion des cours vacants et attributions pour UCLouvain.

**Identique à [uclouvain-course-assign](https://github.com/rdgdeg/uclouvain-course-assign) en design et fonctionnalités**

## 📋 Description

Cette application permet de :
- Importer des données de cours vacants depuis des fichiers Excel
- Gérer les attributions d'enseignants aux cours
- Visualiser et modifier les informations des cours
- Valider les volumes d'attribution
- Suivre l'historique des modifications
- **Gérer les candidatures** (nouveau)
- **Envoyer des notifications par email** (nouveau)

## ✨ Fonctionnalités

### Import Excel
- **Mapping des colonnes** : Interface intuitive pour lier les colonnes Excel aux champs de l'application
- **Détection automatique** : Détection intelligente des colonnes avec possibilité d'ajustement manuel
- **Gestion "Non Attr."** : Traitement automatique des lignes "Non Attr." comme attributions vacantes
- **Validation des volumes** : Contrôle automatique que la somme des attributions correspond aux volumes totaux

### Gestion des cours
- **Affichage moderne** : Interface utilisateur moderne et ergonomique avec shadcn/ui
- **Mode édition sécurisé** : Les champs ne sont éditables qu'après activation du mode édition
- **Historique des modifications** : Suivi complet des changements effectués sur chaque cours
- **Tableau des membres** : Affichage détaillé de tous les membres attribués à un cours
- **Gestion des candidatures** : Système complet de gestion des candidatures avec statuts
- **Notifications email** : Envoi automatique d'emails de confirmation via Resend

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- Un compte Supabase configuré
- Un compte Resend (pour les emails - optionnel)

### Installation

1. Clonez le repository :
```bash
git clone https://github.com/rdgdeg/SSS-ATTRIBUTIONS.git
cd SSS-ATTRIBUTIONS
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp env.example .env.local
```

Éditez `.env.local` et ajoutez vos clés :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
VITE_RESEND_API_KEY=votre_clé_resend (optionnel)
```

4. Configurez Supabase :
   - Créez un projet Supabase
   - Exécutez les scripts SQL dans l'ordre :
     - `supabase-cours-vacants-sql.sql`
     - `supabase-create-history-table.sql`
     - `supabase-create-attributions-table.sql`
     - `supabase-create-candidatures-table.sql` (nouveau)
     - `supabase-add-all-excel-columns.sql` (si nécessaire)

### Lancement en local

1. Démarrez le serveur de développement :
```bash
npm run dev
```

2. Ouvrez votre navigateur à : `http://localhost:5173`

### Build pour production

```bash
npm run build
```

Le dossier `dist/` contiendra les fichiers optimisés pour la production.

## 📁 Structure du projet

```
SSS-ATTRIBUTIONS/
├── src/
│   ├── components/          # Composants React
│   │   ├── admin/          # Interface d'administration
│   │   └── ui/             # Composants UI réutilisables (shadcn/ui)
│   ├── hooks/              # Hooks personnalisés (React Query)
│   ├── pages/              # Pages de l'application
│   ├── types/              # Types TypeScript
│   ├── utils/              # Utilitaires (Excel, Email)
│   ├── integrations/       # Intégrations externes (Supabase)
│   ├── lib/                # Bibliothèques utilitaires
│   ├── App.tsx              # Application principale
│   └── main.tsx            # Point d'entrée
├── public/                 # Assets statiques
├── supabase-*.sql          # Scripts SQL pour Supabase
└── GUIDE-*.md              # Guides de dépannage
```

## 📚 Documentation

- [GUIDE-DEPANNAGE-IMPORT.md](GUIDE-DEPANNAGE-IMPORT.md) - Guide de dépannage pour l'import
- [GUIDE-DEPANNAGE-VOLUMES.md](GUIDE-DEPANNAGE-VOLUMES.md) - Guide de dépannage pour les volumes
- [GUIDE-DEPLOIEMENT.md](GUIDE-DEPLOIEMENT.md) - Guide de déploiement GitHub et Vercel
- [README-COURS-VACANTS.md](README-COURS-VACANTS.md) - Documentation des cours vacants
- [guide-integration-supabase.md](guide-integration-supabase.md) - Guide d'intégration Supabase

## 🔧 Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI modernes
- **Radix UI** - Composants UI accessibles
- **Supabase** - Backend (PostgreSQL)
- **TanStack Query** - Gestion d'état et cache
- **React Router DOM** - Routing
- **XLSX.js** - Lecture de fichiers Excel
- **Resend** - Service d'envoi d'emails
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

## 🚀 Déploiement

### Déploiement sur Vercel

1. Poussez votre code sur GitHub
2. Connectez votre repository à Vercel
3. Configurez les variables d'environnement dans Vercel :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RESEND_API_KEY` (optionnel)
4. Vercel déploiera automatiquement votre application

Voir [GUIDE-DEPLOIEMENT.md](GUIDE-DEPLOIEMENT.md) pour plus de détails.

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
- Basé sur [uclouvain-course-assign](https://github.com/rdgdeg/uclouvain-course-assign)
