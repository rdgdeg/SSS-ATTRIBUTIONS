-- ============================================
-- Script pour ajouter les colonnes manquantes à la table cours_vacants
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase si vous obtenez des erreurs
-- concernant des colonnes manquantes (a_publier, source, enseignants_pressentis, etc.)

-- Colonne pour indiquer si le cours doit être publié
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'a_publier') THEN
        ALTER TABLE cours_vacants ADD COLUMN a_publier BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonne a_publier ajoutée';
    ELSE
        RAISE NOTICE 'Colonne a_publier existe déjà';
    END IF;
END $$;

-- Colonne pour distinguer les cours importés des cours ajoutés manuellement
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'source') THEN
        ALTER TABLE cours_vacants ADD COLUMN source VARCHAR(20) DEFAULT 'importe';
        RAISE NOTICE 'Colonne source ajoutée';
    ELSE
        RAISE NOTICE 'Colonne source existe déjà';
    END IF;
END $$;

-- Colonnes pour les volumes totaux
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_total') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_total DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol1_total ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol1_total existe déjà';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_total') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_total DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol2_total ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol2_total existe déjà';
    END IF;
END $$;

-- Colonnes pour les volumes non attribués
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_non_attribue') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_non_attribue DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol1_non_attribue ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol1_non_attribue existe déjà';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_non_attribue') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_non_attribue DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol2_non_attribue ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol2_non_attribue existe déjà';
    END IF;
END $$;

-- Colonne pour les remarques
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'remarques') THEN
        ALTER TABLE cours_vacants ADD COLUMN remarques TEXT;
        RAISE NOTICE 'Colonne remarques ajoutée';
    ELSE
        RAISE NOTICE 'Colonne remarques existe déjà';
    END IF;
END $$;

-- Colonnes JSONB pour les enseignants pressentis et candidatures
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'enseignants_pressentis') THEN
        ALTER TABLE cours_vacants ADD COLUMN enseignants_pressentis JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonne enseignants_pressentis ajoutée';
    ELSE
        RAISE NOTICE 'Colonne enseignants_pressentis existe déjà';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'candidatures') THEN
        ALTER TABLE cours_vacants ADD COLUMN candidatures JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonne candidatures ajoutée';
    ELSE
        RAISE NOTICE 'Colonne candidatures existe déjà';
    END IF;
END $$;

-- Rafraîchir le cache du schéma PostgREST
NOTIFY pgrst, 'reload schema';
