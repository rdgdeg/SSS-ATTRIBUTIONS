-- Table pour les candidatures
CREATE TABLE IF NOT EXISTS candidatures (
  id BIGSERIAL PRIMARY KEY,
  cours_vacant_id BIGINT NOT NULL REFERENCES cours_vacants(id) ON DELETE CASCADE,
  nom TEXT,
  prenom TEXT,
  email TEXT,
  statut TEXT DEFAULT 'en_attente',
  date_candidature TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  remarques TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_candidatures_cours_vacant_id ON candidatures(cours_vacant_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures(statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_date ON candidatures(date_candidature);

-- RLS (Row Level Security) - à activer selon vos besoins
-- ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;
