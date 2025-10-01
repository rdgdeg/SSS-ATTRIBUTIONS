// ============================================
// 1. Structure SQL pour Supabase
// ============================================
/*
-- Créez cette table dans Supabase SQL Editor

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

-- Politique pour lecture publique (à ajuster selon vos besoins)
CREATE POLICY "Enable read access for all users" ON cours FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON attributions FOR SELECT USING (true);
*/

// ============================================
// 2. lib/supabase.js - Client Supabase
// ============================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// 3. lib/dataHelpers.js - Fonctions utilitaires
// ============================================

// Convertir les valeurs #VALEUR! en 0
export const parseVolume = (value) => {
  if (!value || value === '' || String(value).includes('#')) {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Charger tous les cours avec leurs attributions
export const fetchCoursWithAttributions = async () => {
  try {
    // Récupérer tous les cours
    const { data: coursData, error: coursError } = await supabase
      .from('cours')
      .select('*')
      .order('code');

    if (coursError) throw coursError;

    // Récupérer toutes les attributions
    const { data: attributionsData, error: attribError } = await supabase
      .from('attributions')
      .select('*');

    if (attribError) throw attribError;

    // Grouper les données
    const coursMap = {};
    
    coursData.forEach(c => {
      const attrs = attributionsData.filter(a => a.cours_code === c.code);
      const coordinateur = attrs.find(a => a.fonction === 'Coordinateur');
      const enseignants = attrs.filter(a => 
        a.fonction !== 'Coordinateur' && a.enseignant && a.enseignant.trim() !== ''
      );
      
      const totalVol1 = attrs.reduce((sum, a) => sum + parseVolume(a.vol1_enseignant), 0);
      const totalVol2 = attrs.reduce((sum, a) => sum + parseVolume(a.vol2_enseignant), 0);
      
      coursMap[c.code] = {
        ...c,
        coordinateur,
        enseignants,
        attributions: attrs,
        totalVol1,
        totalVol2,
        estAttribue: attrs.some(a => a.enseignant && a.enseignant.trim() !== '')
      };
    });

    return Object.values(coursMap);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    throw error;
  }
};

// Rechercher des cours
export const searchCours = async (searchTerm, dptFilter = null) => {
  try {
    let query = supabase
      .from('cours')
      .select('*');

    if (searchTerm) {
      query = query.or(`code.ilike.%${searchTerm}%,intitule_abrege.ilike.%${searchTerm}%`);
    }

    if (dptFilter) {
      query = query.eq('dpt_attribution', dptFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
};

// Obtenir les statistiques
export const getStatistics = async () => {
  try {
    const { data: cours, error: coursError } = await supabase
      .from('cours')
      .select('code');

    const { data: attributions, error: attrError } = await supabase
      .from('attributions')
      .select('cours_code, enseignant, fonction');

    if (coursError || attrError) throw coursError || attrError;

    const coursAvecEnseignant = new Set(
      attributions
        .filter(a => a.enseignant && a.enseignant.trim() !== '')
        .map(a => a.cours_code)
    );

    const coursAvecCoordinateur = new Set(
      attributions
        .filter(a => a.fonction === 'Coordinateur')
        .map(a => a.cours_code)
    );

    return {
      totalCours: cours.length,
      coursAttribues: coursAvecEnseignant.size,
      coursAvecCoordinateur: coursAvecCoordinateur.size,
      coursNonAttribues: cours.length - coursAvecEnseignant.size
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    throw error;
  }
};

// ============================================
// 4. scripts/importData.js - Script d'import Excel vers Supabase
// ============================================
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Clé service pour les opérations d'écriture
const supabase = createClient(supabaseUrl, supabaseKey);

async function importFromExcel(filePath) {
  console.log('📂 Lecture du fichier Excel...');
  
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['2025 Attributions'];
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

  console.log(`✅ ${data.length} lignes trouvées`);

  // Fonction pour nettoyer les valeurs
  const parseVol = (value) => {
    if (!value || value === '' || String(value).includes('#')) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Grouper par cours
  const coursMap = new Map();
  
  data.forEach(row => {
    const code = row.Cours;
    if (!code) return;

    if (!coursMap.has(code)) {
      coursMap.set(code, {
        code,
        intitule_abrege: row['Intitulé abrégé'] || '',
        etat_vacance: row['Etat vac.'] || '',
        vol1_cours: parseVol(row['Vol1. cours']),
        vol2_cours: parseVol(row['Vol2. cours']),
        vol1_total: parseVol(row['Vol.1 Total']),
        vol2_total: parseVol(row['Vol.2 Total']),
        dpt_charge: row['Dpt Charge'] || '',
        dpt_attribution: row['Dpt Attribution'] || '',
        type_cours: row.Type || '',
        periodicite: row['Périodicité'] || '',
        attributions: []
      });
    }

    // Ajouter l'attribution si elle existe
    const cours = coursMap.get(code);
    cours.attributions.push({
      enseignant: row.Enseignant || '',
      email_ucl: row['Email UCL'] || '',
      fonction: row.Fonction || '',
      vol1_enseignant: parseVol(row['Vol1. enseignant']),
      vol2_enseignant: parseVol(row['Vol2. enseignant']),
      debut: row.Début ? parseInt(row.Début) : null,
      duree: row.Durée ? parseInt(row.Durée) : null,
      mode_paiement_vol1: row['Mode paiement vol1'] || '',
      mode_paiement_vol2: row['Mode paiement vol2'] || '',
      procedure_attribution: row['Procédure d\'attribution'] || ''
    });
  });

  console.log(`📊 ${coursMap.size} cours uniques trouvés`);

  // Insérer dans Supabase
  console.log('\n🔄 Import dans Supabase...');

  let coursInserted = 0;
  let attribInserted = 0;

  for (const [code, coursData] of coursMap) {
    try {
      // Insérer le cours
      const { attributions, ...coursToInsert } = coursData;
      
      const { error: coursError } = await supabase
        .from('cours')
        .upsert(coursToInsert, { onConflict: 'code' });

      if (coursError) {
        console.error(`❌ Erreur cours ${code}:`, coursError.message);
        continue;
      }
      coursInserted++;

      // Insérer les attributions
      for (const attr of attributions) {
        const { error: attrError } = await supabase
          .from('attributions')
          .insert({
            cours_code: code,
            ...attr
          });

        if (attrError) {
          console.error(`❌ Erreur attribution ${code}:`, attrError.message);
        } else {
          attribInserted++;
        }
      }

      if (coursInserted % 100 === 0) {
        console.log(`⏳ Progression: ${coursInserted} cours importés...`);
      }
    } catch (error) {
      console.error(`❌ Erreur générale ${code}:`, error);
    }
  }

  console.log('\n✅ Import terminé!');
  console.log(`📚 Cours importés: ${coursInserted}`);
  console.log(`👥 Attributions importées: ${attribInserted}`);
}

// Exécution
const filePath = process.argv[2] || './2025_Attrib.xlsx';
importFromExcel(filePath)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

// ============================================
// 5. .env.local - Variables d'environnement
// ============================================
/*
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_KEY=votre_service_key
*/

// ============================================
// 6. package.json - Dépendances
// ============================================
/*
{
  "name": "attributions-cours",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "import": "node scripts/importData.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "xlsx": "^0.18.5"
  }
}
*/

// ============================================
// 7. vercel.json - Configuration Vercel
// ============================================
/*
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
*/