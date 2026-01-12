# 🚀 Guide d'Intégration Supabase - Attributions de Cours

## 📋 Étape 1 : Configuration de Supabase

### 1.1 Créer les tables

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **dhuuduphwvxrecfqvbbw**
3. Cliquez sur **SQL Editor** dans le menu gauche
4. Créez une nouvelle requête
5. **Copiez tout le contenu** du fichier "Configuration Supabase - SQL et Import"
6. Cliquez sur **Run** pour exécuter le script

✅ Vous devriez voir : "Success. No rows returned"

### 1.2 Vérifier les tables

Dans **Table Editor**, vous devriez voir 3 nouvelles tables :
- `cours` (informations des cours)
- `attributions` (enseignants et volumes)
- `demandes` (demandes de modification)

## 📥 Étape 2 : Importer vos données Excel

### Option A : Interface Web (Recommandé)

J'ai créé un composant React pour importer directement depuis l'interface :

1. **Utilisez le composant "Composant Import Excel vers Supabase"**
2. Cliquez sur "Sélectionner un fichier"
3. Choisissez votre fichier `2025_Attrib.xlsx`
4. Cliquez sur "Importer"
5. Attendez la fin de l'import (quelques minutes)

Le composant :
- ✅ Lit automatiquement la feuille "2025 Attributions"
- ✅ Convertit les #VALEUR! en 0
- ✅ Gère les cours existants (mise à jour)
- ✅ Affiche la progression en temps réel
- ✅ Montre les statistiques d'import

### Option B : Script Node.js

Si vous préférez un script, voici le code :

```javascript
// import-data.js
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import fs from 'fs';

const SUPABASE_URL = 'https://dhuuduphwvxrecfqvbbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIxMTI4OSwiZXhwIjoyMDgzNzg3Mjg5fQ.8MxRin8vRlOvGTwFS0YxmU8zf6XsTRj5KKsF2leUZwY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const parseVolume = (value) => {
  if (!value || value === '' || String(value).includes('#')) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

async function importData(filePath) {
  console.log('📂 Lecture du fichier Excel...');
  
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['2025 Attributions'];
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

  console.log(`✅ ${data.length} lignes trouvées`);

  const coursMap = new Map();
  
  data.forEach(row => {
    const code = row.Cours;
    if (!code) return;

    if (!coursMap.has(code)) {
      coursMap.set(code, {
        code,
        intitule_abrege: row['Intitulé abrégé'] || '',
        etat_vacance: row['Etat vac.'] || '',
        vol1_cours: parseVolume(row['Vol1. cours']),
        vol2_cours: parseVolume(row['Vol2. cours']),
        vol1_total: parseVolume(row['Vol.1 Total']),
        vol2_total: parseVolume(row['Vol.2 Total']),
        coef1: parseVolume(row.Coef1),
        coef2: parseVolume(row.Coef2),
        dpt_charge: row['Dpt Charge'] || '',
        dpt_attribution: row['Dpt Attribution'] || '',
        type_cours: row.Type || '',
        periodicite: row['Périodicité'] || '',
        attributions: []
      });
    }

    const cours = coursMap.get(code);
    cours.attributions.push({
      enseignant: row.Enseignant || '',
      matricule: row.Matricule || '',
      email_ucl: row['Email UCL'] || '',
      date_naissance: row['Date naissance'] || '',
      fonction: row.Fonction || '',
      vol1_enseignant: parseVolume(row['Vol1. enseignant']),
      vol2_enseignant: parseVolume(row['Vol2. enseignant']),
      debut: row.Début ? parseInt(row.Début) : null,
      duree: row.Durée ? parseInt(row.Durée) : null,
      mode_paiement_vol1: row['Mode paiement vol1'] || '',
      mode_paiement_vol2: row['Mode paiement vol2'] || '',
      procedure_attribution: row['Procédure d\'attribution'] || '',
      remarque: row.Remarque || '',
      candidature: row.Candidature || ''
    });
  });

  console.log(`📊 ${coursMap.size} cours uniques trouvés`);
  console.log('\n🔄 Import dans Supabase...');

  let coursInserted = 0;
  let attribInserted = 0;

  for (const [code, coursData] of coursMap) {
    try {
      const { attributions, ...coursToInsert } = coursData;
      
      // Upsert cours
      const { error: coursError } = await supabase
        .from('cours')
        .upsert(coursToInsert, { onConflict: 'code' });

      if (coursError) {
        console.error(`❌ Erreur cours ${code}:`, coursError.message);
        continue;
      }
      coursInserted++;

      // Supprimer anciennes attributions
      await supabase.from('attributions').delete().eq('cours_code', code);

      // Insérer nouvelles attributions
      if (attributions.length > 0) {
        const { error: attrError } = await supabase
          .from('attributions')
          .insert(attributions.map(a => ({ cours_code: code, ...a })));

        if (attrError) {
          console.error(`❌ Erreur attributions ${code}:`, attrError.message);
        } else {
          attribInserted += attributions.length;
        }
      }

      if (coursInserted % 100 === 0) {
        console.log(`⏳ Progression: ${coursInserted} cours importés...`);
      }
    } catch (error) {
      console.error(`❌ Erreur ${code}:`, error);
    }
  }

  console.log('\n✅ Import terminé!');
  console.log(`📚 Cours importés: ${coursInserted}`);
  console.log(`👥 Attributions importées: ${attribInserted}`);
}

// Exécution
const filePath = process.argv[2] || './2025_Attrib.xlsx';
importData(filePath)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
```

**Pour exécuter :**
```bash
npm install @supabase/supabase-js xlsx
node import-data.js 2025_Attrib.xlsx
```

## 🔧 Étape 3 : Créer les fichiers de configuration

### 3.1 Créer `lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhuuduphwvxrecfqvbbw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.2 Créer `lib/dataHelpers.js`

```javascript
import { supabase } from './supabase';

export const parseVolume = (value) => {
  if (!value || value === '' || String(value).includes('#')) {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const fetchCoursWithAttributions = async () => {
  try {
    const { data: coursData, error: coursError } = await supabase
      .from('cours')
      .select('*')
      .order('code');

    if (coursError) throw coursError;

    const { data: attributionsData, error: attribError } = await supabase
      .from('attributions')
      .select('*');

    if (attribError) throw attribError;

    const coursMap = {};
    
    coursData.forEach(c => {
      const attrs = attributionsData.filter(a => a.cours_code === c.code);
      const coordinateur = attrs.find(a => a.fonction === 'Coordinateur');
      const enseignants = attrs.filter(a => 
        a.fonction !== 'Coordinateur' && a.enseignant && a.enseignant.trim() !== ''
      );
      
      const sommeVol1 = attrs.reduce((sum, a) => sum + parseVolume(a.vol1_enseignant), 0);
      const sommeVol2 = attrs.reduce((sum, a) => sum + parseVolume(a.vol2_enseignant), 0);
      
      coursMap[c.code] = {
        ...c,
        coordinateur,
        enseignants,
        attributions: attrs,
        sommeVol1,
        sommeVol2,
        ecartVol1: Math.abs(sommeVol1 - (c.vol1_total || 0)),
        ecartVol2: Math.abs(sommeVol2 - (c.vol2_total || 0)),
        coherent: Math.abs(sommeVol1 - (c.vol1_total || 0)) < 0.01 && 
                  Math.abs(sommeVol2 - (c.vol2_total || 0)) < 0.01,
        estAttribue: attrs.some(a => a.enseignant && a.enseignant.trim() !== '')
      };
    });

    return Object.values(coursMap);
  } catch (error) {
    console.error('Erreur chargement:', error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const cours = await fetchCoursWithAttributions();
    
    return {
      totalCours: cours.length,
      coursAttribues: cours.filter(c => c.estAttribue).length,
      coursCoherents: cours.filter(c => c.coherent).length,
      coursIncoherents: cours.filter(c => !c.coherent).length,
      coursNonAttribues: cours.filter(c => !c.estAttribue).length
    };
  } catch (error) {
    console.error('Erreur statistiques:', error);
    throw error;
  }
};

export const submitDemande = async (demande) => {
  try {
    const { data, error } = await supabase
      .from('demandes')
      .insert({
        cours_code: demande.cours,
        type_demande: demande.type,
        description: demande.description,
        statut: 'En attente'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur soumission demande:', error);
    throw error;
  }
};

export const fetchDemandes = async () => {
  try {
    const { data, error } = await supabase
      .from('demandes')
      .select(`
        *,
        cours:cours_code (
          code,
          intitule_abrege
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur chargement demandes:', error);
    throw error;
  }
};
```

## 📦 Étape 4 : Mettre à jour votre application React

### 4.1 Installer les dépendances

```bash
npm install @supabase/supabase-js
```

### 4.2 Créer `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://dhuuduphwvxrecfqvbbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk
```

### 4.3 Modifier votre composant principal

Remplacez `generateMockData()` par :

```javascript
const [coursData, setCoursData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const data = await fetchCoursWithAttributions();
    setCoursData(data);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 Étape 5 : Structure finale du projet

```
mon-projet/
├── lib/
│   ├── supabase.js          # Client Supabase
│   └── dataHelpers.js       # Fonctions utilitaires
├── pages/
│   ├── index.jsx            # Page principale (liste des cours)
│   └── import.jsx           # Page d'import Excel
├── .env.local               # Variables d'environnement
├── package.json
└── next.config.js
```

## ✅ Étape 6 : Vérification

### 6.1 Vérifier l'import

Allez sur Supabase > Table Editor > `cours` et vérifiez que vos cours sont bien importés.

### 6.2 Tester l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) et vérifiez que :
- ✅ Les cours s'affichent
- ✅ Les coordinateurs sont visibles
- ✅ Les enseignants avec volumes apparaissent
- ✅ Les totaux sont cohérents

## 🚀 Étape 7 : Déploiement sur Vercel

### 7.1 Connecter le projet

```bash
vercel
```

### 7.2 Ajouter les variables d'environnement

Dans Vercel Dashboard > Settings > Environment Variables :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 7.3 Déployer

```bash
vercel --prod
```

## 📊 Fonctionnalités disponibles

Avec cette configuration, vous pouvez maintenant :

1. ✅ **Importer vos données Excel** via l'interface web
2. ✅ **Consulter tous les cours** avec pagination
3. ✅ **Voir les coordinateurs** mis en évidence
4. ✅ **Voir les enseignants** et leurs volumes horaires
5. ✅ **Vérifier la cohérence** des volumes
6. ✅ **Soumettre des demandes** de modification
7. ✅ **Gérer les demandes** dans une page dédiée

## 🔒 Sécurité

Les politiques RLS (Row Level Security) sont activées avec lecture publique. Pour restreindre l'accès :

```sql
-- Supprimer les politiques publiques
DROP POLICY "Enable read access for all users" ON cours;
DROP POLICY "Enable read access for all users" ON attributions;

-- Ajouter authentification
CREATE POLICY "Enable read for authenticated users" ON cours
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 🆘 Dépannage

### Erreur "Failed to fetch"
- Vérifiez les URL et clés Supabase
- Vérifiez que les tables existent
- Vérifiez les politiques RLS

### Import échoue
- Vérifiez que la feuille s'appelle "2025 Attributions"
- Vérifiez le format du fichier (.xlsx)
- Consultez les logs d'erreur

### Données ne s'affichent pas
- Vérifiez que l'import s'est bien déroulé dans Supabase
- Vérifiez la console du navigateur pour les erreurs
- Testez les requêtes directement dans Supabase

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [API Supabase JS](https://supabase.com/docs/reference/javascript)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)

Voilà ! Vous avez maintenant une application complète connectée à Supabase ! 🎉