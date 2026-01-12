-- ============================================
-- Table complète pour les cours vacants avec toutes les fonctionnalités
-- ============================================

-- Ajouter les colonnes manquantes si la table existe déjà
DO $$ 
BEGIN
    -- Colonne pour indiquer si le cours doit être publié
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'a_publier') THEN
        ALTER TABLE cours_vacants ADD COLUMN a_publier BOOLEAN DEFAULT true;
    END IF;

    -- Colonne pour distinguer les cours importés des cours ajoutés manuellement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'source') THEN
        ALTER TABLE cours_vacants ADD COLUMN source VARCHAR(20) DEFAULT 'importe';
    END IF;

    -- Colonnes pour les volumes totaux (si elles n'existent pas déjà)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_total') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_total DECIMAL(10,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_total') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_total DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Colonnes pour les volumes non attribués
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_non_attribue') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_non_attribue DECIMAL(10,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_non_attribue') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_non_attribue DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Colonne pour les remarques (si elle n'existe pas déjà)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'remarques') THEN
        ALTER TABLE cours_vacants ADD COLUMN remarques TEXT;
    END IF;

    -- Colonnes JSONB pour les enseignants pressentis et candidatures
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'enseignants_pressentis') THEN
        ALTER TABLE cours_vacants ADD COLUMN enseignants_pressentis JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'candidatures') THEN
        ALTER TABLE cours_vacants ADD COLUMN candidatures JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Index supplémentaires
CREATE INDEX IF NOT EXISTS idx_cours_vacants_a_publier ON cours_vacants(a_publier);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_source ON cours_vacants(source);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_vol1_total ON cours_vacants(vol1_total);
CREATE INDEX IF NOT EXISTS idx_cours_vacants_vol2_total ON cours_vacants(vol2_total);

-- Contrainte d'unicité sur code_cours
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cours_vacants_code_cours_unique'
    ) THEN
        ALTER TABLE cours_vacants ADD CONSTRAINT cours_vacants_code_cours_unique UNIQUE (code_cours);
    END IF;
END $$;

-- Commentaires pour documentation
COMMENT ON COLUMN cours_vacants.a_publier IS 'Indique si le cours doit être publié (true) ou non (false)';
COMMENT ON COLUMN cours_vacants.source IS 'Source du cours: "importe" pour les cours importés, "manuel" pour les cours ajoutés manuellement';
COMMENT ON COLUMN cours_vacants.vol1_total IS 'Volume 1 total du cours';
COMMENT ON COLUMN cours_vacants.vol2_total IS 'Volume 2 total du cours';
COMMENT ON COLUMN cours_vacants.vol1_non_attribue IS 'Volume 1 non attribué (cours vacant)';
COMMENT ON COLUMN cours_vacants.vol2_non_attribue IS 'Volume 2 non attribué (cours vacant)';
COMMENT ON COLUMN cours_vacants.remarques IS 'Remarques générales sur le cours';
COMMENT ON COLUMN cours_vacants.enseignants_pressentis IS 'Liste des enseignants pressentis avec leurs volumes (format JSON)';
COMMENT ON COLUMN cours_vacants.candidatures IS 'Liste des candidatures pour ce cours (format JSON)';

-- Structure JSON attendue pour enseignants_pressentis:
-- [
--   {
--     "nom": "Nom",
--     "prenom": "Prénom",
--     "email": "email@example.com",
--     "vol1": 10.5,
--     "vol2": 5.0
--   }
-- ]

-- Structure JSON attendue pour candidatures:
-- [
--   {
--     "nom": "Nom du candidat",
--     "date": "01/01/2024",
--     "commentaire": "Commentaire optionnel"
--   }
-- ]
