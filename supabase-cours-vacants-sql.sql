-- ============================================
-- Table pour les cours vacants détaillés
-- ============================================

CREATE TABLE IF NOT EXISTS cours_vacants (
  id SERIAL PRIMARY KEY,
  
  -- Informations générales du cours
  sigle VARCHAR(20),
  cnum INTEGER,
  code_cours VARCHAR(20) NOT NULL,
  intitule TEXT,
  intitule_court VARCHAR(255),
  intitule_complet TEXT,
  inactif BOOLEAN DEFAULT false,
  etat_validation VARCHAR(100),
  etat_vacance VARCHAR(100),
  
  -- Causes (plusieurs champs pour différentes causes)
  cause_1 TEXT,
  cause_2 TEXT,
  cause_3 TEXT,
  cause_4 TEXT,
  cause_vacance TEXT,
  cause_decision TEXT,
  
  -- Dates et associations
  date_declenchement DATE,
  date_declenchement_vacance DATE,
  cours_associe VARCHAR(20),
  cours_en_progress VARCHAR(50),
  
  -- Volumes et coefficients
  vol1 DECIMAL(10,2) DEFAULT 0,
  vol2 DECIMAL(10,2) DEFAULT 0,
  coef1 DECIMAL(10,2),
  coef2 DECIMAL(10,2),
  volume_1 DECIMAL(10,2) DEFAULT 0,
  volume_2 DECIMAL(10,2) DEFAULT 0,
  vol_a_2026 DECIMAL(10,2) DEFAULT 0,
  volume_1_tc DECIMAL(10,2) DEFAULT 0,
  volume_2_to DECIMAL(10,2) DEFAULT 0,
  
  -- Périodicité et départements
  periodicite VARCHAR(50),
  dpt_client VARCHAR(20),
  dpt_charge VARCHAR(20),
  dpt_attribution VARCHAR(20),
  type_cours VARCHAR(50),
  roul_type VARCHAR(50),
  
  -- Informations personne
  nom VARCHAR(255),
  prenom VARCHAR(255),
  matricule VARCHAR(50),
  date_naissance DATE,
  email VARCHAR(255),
  email_ucl VARCHAR(255),
  fonction VARCHAR(100),
  supplement VARCHAR(100),
  
  -- Attribution
  debut INTEGER,
  duree INTEGER,
  vol1_enseignant DECIMAL(10,2) DEFAULT 0,
  vol2_enseignant DECIMAL(10,2) DEFAULT 0,
  vol1_attrib DECIMAL(10,2) DEFAULT 0,
  vol2_attrib DECIMAL(10,2) DEFAULT 0,
  mode_paiement VARCHAR(100),
  poste VARCHAR(100),
  
  -- Remarques
  remarque TEXT,
  remarque_speciale TEXT,
  remarque_2 TEXT,
  procedure TEXT,
  
  -- Autres
  id_equipe VARCHAR(50),
  candidat TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cours_vacants_code ON cours_vacants(code_cours);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_dpt ON cours_vacants(dpt_attribution);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_etat ON cours_vacants(etat_validation);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_matricule ON cours_vacants(matricule);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_candidat ON cours_vacants(candidat);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cours_vacants_updated_at BEFORE UPDATE ON cours_vacants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security
ALTER TABLE cours_vacants ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique (à ajuster selon vos besoins)
CREATE POLICY "Enable read access for all users" ON cours_vacants 
  FOR SELECT USING (true);

-- Politique pour insertion (si nécessaire)
CREATE POLICY "Enable insert access for authenticated users" ON cours_vacants 
  FOR INSERT WITH CHECK (true);

-- Politique pour mise à jour (si nécessaire)
CREATE POLICY "Enable update access for authenticated users" ON cours_vacants 
  FOR UPDATE USING (true);

-- Commentaires pour documentation
COMMENT ON TABLE cours_vacants IS 'Table contenant les informations détaillées des cours vacants';
COMMENT ON COLUMN cours_vacants.code_cours IS 'Code unique du cours (clé principale pour identification)';
COMMENT ON COLUMN cours_vacants.candidat IS 'Informations sur le candidat pour ce cours vacant';
