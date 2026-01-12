-- ============================================
-- Table pour l'historique des modifications des cours vacants
-- ============================================

CREATE TABLE IF NOT EXISTS cours_vacants_history (
  id SERIAL PRIMARY KEY,
  cours_vacant_id INTEGER NOT NULL REFERENCES cours_vacants(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  modified_by VARCHAR(255),
  modified_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_cours_vacants_history_cours_id ON cours_vacants_history(cours_vacant_id);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_history_modified_at ON cours_vacants_history(modified_at DESC);

-- Commentaires
COMMENT ON TABLE cours_vacants_history IS 'Historique des modifications des cours vacants';
COMMENT ON COLUMN cours_vacants_history.cours_vacant_id IS 'ID du cours vacant modifié';
COMMENT ON COLUMN cours_vacants_history.field_name IS 'Nom du champ modifié';
COMMENT ON COLUMN cours_vacants_history.old_value IS 'Ancienne valeur';
COMMENT ON COLUMN cours_vacants_history.new_value IS 'Nouvelle valeur';
COMMENT ON COLUMN cours_vacants_history.modified_by IS 'Utilisateur qui a effectué la modification';

-- Activer Row Level Security
ALTER TABLE cours_vacants_history ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique
CREATE POLICY "Enable read access for all users" ON cours_vacants_history 
  FOR SELECT USING (true);

-- Politique pour insertion
CREATE POLICY "Enable insert access for authenticated users" ON cours_vacants_history 
  FOR INSERT WITH CHECK (true);
