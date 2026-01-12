-- ============================================
-- Table pour les attributions des cours vacants
-- ============================================
-- Cette table stocke toutes les attributions (personnes) pour chaque cours

CREATE TABLE IF NOT EXISTS cours_vacants_attributions (
  id SERIAL PRIMARY KEY,
  cours_vacant_id INTEGER NOT NULL REFERENCES cours_vacants(id) ON DELETE CASCADE,
  
  -- Informations personne
  nom VARCHAR(255),
  prenom VARCHAR(255),
  matricule VARCHAR(50),
  date_naissance DATE,
  email_ucl VARCHAR(255),
  fonction VARCHAR(100),
  supplement VARCHAR(100),
  
  -- Attribution
  debut INTEGER,
  duree INTEGER,
  vol1_attrib DECIMAL(10,2) DEFAULT 0,
  vol2_attrib DECIMAL(10,2) DEFAULT 0,
  mode_paiement VARCHAR(100),
  poste VARCHAR(100),
  
  -- Autres
  remarque TEXT,
  cause_1 TEXT,
  cause_2 TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_attributions_cours_id ON cours_vacants_attributions(cours_vacant_id);
CREATE INDEX IF NOT EXISTS idx_attributions_fonction ON cours_vacants_attributions(fonction);
CREATE INDEX IF NOT EXISTS idx_attributions_matricule ON cours_vacants_attributions(matricule);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_attributions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attributions_updated_at BEFORE UPDATE ON cours_vacants_attributions
    FOR EACH ROW EXECUTE FUNCTION update_attributions_updated_at_column();

-- Activer Row Level Security
ALTER TABLE cours_vacants_attributions ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique
CREATE POLICY "Enable read access for all users" ON cours_vacants_attributions 
  FOR SELECT USING (true);

-- Politique pour insertion
CREATE POLICY "Enable insert access for authenticated users" ON cours_vacants_attributions 
  FOR INSERT WITH CHECK (true);

-- Politique pour mise à jour
CREATE POLICY "Enable update access for authenticated users" ON cours_vacants_attributions 
  FOR UPDATE USING (true);

-- Commentaires
COMMENT ON TABLE cours_vacants_attributions IS 'Table contenant toutes les attributions (personnes) pour chaque cours vacant';
COMMENT ON COLUMN cours_vacants_attributions.vol1_attrib IS 'Volume 1 attribué à cette personne (Vol1. Attribution)';
COMMENT ON COLUMN cours_vacants_attributions.vol2_attrib IS 'Volume 2 attribué à cette personne (Vol2. Attribution)';
