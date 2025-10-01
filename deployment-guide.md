# 🚀 Guide de Déploiement - Application Attributions de Cours

## 📋 Prérequis

- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Vercel](https://vercel.com) (gratuit)
- Node.js installé (version 18+)
- Le fichier Excel `2025_Attrib.xlsx`

## 🗂️ Structure du Projet

```
attributions-cours/
├── pages/
│   └── index.jsx              # Composant principal
├── lib/
│   ├── supabase.js           # Client Supabase
│   └── dataHelpers.js        # Fonctions utilitaires
├── scripts/
│   └── importData.js         # Script d'import Excel
├── .env.local                # Variables d'environnement
├── package.json
└── next.config.js
```

## 📦 Étape 1 : Configuration du Projet Next.js

### 1.1 Créer le projet

```bash
npx create-next-app@latest attributions-cours
cd attributions-cours
```

Options lors de la création :
- TypeScript: **No**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No**
- App Router: **No** (on utilise Pages Router)
- Customize default import alias: **No**

### 1.2 Installer les dépendances

```bash
npm install @supabase/supabase-js lucide-react
npm install --save-dev xlsx
```

### 1.3 Créer la structure des dossiers

```bash
mkdir lib scripts
```

## 🗄️ Étape 2 : Configuration Supabase

### 2.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL** et **anon key**

### 2.2 Créer les tables

Dans le **SQL Editor** de Supabase, exécutez ce script :

```sql
-- Table des cours
CREATE TABLE cours (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  intitule_abrege TEXT NOT NULL,
  etat_vacance VARCHAR(50),
  vol1_cours DECIMAL(10,2) DEFAULT 0,
  vol2_cours DECIMAL(10,2) DEFAULT 0,
  vol1_total DECIMAL(10,2) DEFAULT 0,
  vol2_total DECIMAL(10,2) DEFAULT 0,
  dpt_charge VARCHAR(20),
  dpt_attribution VARCHAR(20),
  type_cours VARCHAR(50),
  periodicite VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des attributions
CREATE TABLE attributions (
  id SERIAL PRIMARY KEY,
  cours_code VARCHAR(20) REFERENCES cours(code) ON DELETE CASCADE,
  enseignant VARCHAR(255),
  email_ucl VARCHAR(255),
  fonction VARCHAR(50),
  vol1_enseignant DECIMAL(10,2) DEFAULT 0,
  vol2_enseignant DECIMAL(10,2) DEFAULT 0,
  debut INTEGER,
  duree INTEGER,
  mode_paiement_vol1 VARCHAR(100),
  mode_paiement_vol2 VARCHAR(100),
  procedure_attribution TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_cours_code ON cours(code);
CREATE INDEX idx_cours_dpt ON cours(dpt_attribution);
CREATE INDEX idx_attributions_cours ON attributions(cours_code);
CREATE INDEX idx_attributions_fonction ON attributions(fonction);

-- Activer Row Level Security
ALTER TABLE cours ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributions ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique
CREATE POLICY "Enable read access for all users" ON cours 
  FOR SELECT USING (true);
  
CREATE POLICY "Enable read access for all users" ON attributions 
  FOR SELECT USING (true);
```

### 2.3 Obtenir les clés API

Dans **Settings > API** :
- Copiez l'**URL** du projet
- Copiez la **anon public** key
- Copiez la **service_role** key (pour l'import)

## ⚙️ Étape 3 : Configuration du Code

### 3.1 Créer `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Créer `lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.3 Créer `lib/dataHelpers.js`

Copiez le contenu du fichier "Configuration Supabase" (section 3).

### 3.4 Créer `pages/index.jsx`

Copiez le contenu du fichier "App.jsx - Composant avec Supabase".

### 3.5 Créer `scripts/importData.js`

Copiez le script d'import du fichier "Configuration Supabase" (section 4).

### 3.6 Modifier `package.json`

Ajoutez ces scripts :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "import": "node scripts/importData.js"
  }
}
```

## 📥 Étape 4 : Import des Données

### 4.1 Placer le fichier Excel

Copiez `2025_Attrib.xlsx` à la racine du projet.

### 4.2 Lancer l'import

```bash
npm run import
```

Vous devriez voir :
```
📂 Lecture du fichier Excel...
✅ 3755 lignes trouvées
📊 1581 cours uniques trouvés

🔄 Import dans Supabase...
⏳ Progression: 100 cours importés...
...
✅ Import terminé!
📚 Cours importés: 1581
👥 Attributions importées: 3755
```

### 4.3 Vérifier dans Supabase

Allez dans **Table Editor** et vérifiez que les tables contiennent les données.

## 🧪 Étape 5 : Tester en Local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

Vérifiez que :
- ✅ Les statistiques s'affichent correctement
- ✅ La recherche fonctionne
- ✅ Les filtres par département fonctionnent
- ✅ Les détails des cours s'affichent au clic
- ✅ Les volumes horaires sont corrects (les #VALEUR! sont à 0)

## 🚀 Étape 6 : Déploiement sur Vercel

### 6.1 Préparer le dépôt Git

```bash
git init
git add .
git commit -m "Initial commit"
```

Poussez sur GitHub/GitLab :

```bash
# GitHub
gh repo create attributions-cours --public --source=. --remote=origin --push

# Ou manuellement
git remote add origin https://github.com/VOTRE_USERNAME/attributions-cours.git
git branch -M main
git push -u origin main
```

### 6.2 Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **Add New Project**
3. Importez votre dépôt Git
4. Dans **Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre anon key

5. Cliquez sur **Deploy**

### 6.3 Configuration du domaine (optionnel)

Dans **Settings > Domains**, vous pouvez configurer un domaine personnalisé.

## 🔒 Étape 7 : Sécurité (Optionnel)

### 7.1 Restreindre l'accès aux données

Si vous voulez restreindre l'accès, modifiez les politiques RLS dans Supabase :

```sql
-- Supprimer la politique publique
DROP POLICY "Enable read access for all users" ON cours;
DROP POLICY "Enable read access for all users" ON attributions;

-- Créer une politique avec authentification
CREATE POLICY "Enable read for authenticated users only" ON cours
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users only" ON attributions
  FOR SELECT USING (auth.role() = 'authenticated');
```

Puis ajoutez l'authentification dans votre application Next.js avec Supabase Auth.

### 7.2 Limiter les domaines autorisés

Dans Supabase **Authentication > URL Configuration**, ajoutez votre domaine Vercel.

## 📊 Étape 8 : Maintenance

### 8.1 Mettre à jour les données

Pour mettre à jour les données, relancez simplement :

```bash
npm run import
```

Les données existantes seront mises à jour (upsert sur le code du cours).

### 8.2 Sauvegarder la base de données

Dans Supabase **Settings > Database**, vous pouvez créer des sauvegardes automatiques.

## 🐛 Dépannage

### Erreur "Failed to fetch"

- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que les politiques RLS permettent la lecture publique
- Vérifiez que l'URL Supabase est accessible

### Les volumes horaires sont incorrects

- Vérifiez que la fonction `parseVolume` convertit bien les `#VALEUR!` en 0
- Vérifiez les données dans Supabase Table Editor

### L'import échoue

- Vérifiez que le fichier Excel est au bon endroit
- Vérifiez que la `SUPABASE_SERVICE_KEY` est correcte
- Vérifiez les logs pour voir quelle ligne pose problème

### Erreur de build sur Vercel

- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez que les variables d'environnement sont configurées sur Vercel
- Consultez les logs de build pour plus de détails

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

## 🎉 Félicitations !

Votre application est maintenant en ligne et prête à être utilisée ! 🚀