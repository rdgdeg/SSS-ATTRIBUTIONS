-- ============================================
-- Script pour ajouter TOUTES les colonnes Excel manquantes à la table cours_vacants
-- ============================================
-- Ce script ajoute toutes les colonnes présentes dans le fichier Excel
-- Exécutez ce script dans le SQL Editor de Supabase

-- Intitulé complet (Intit.Compl)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'intitule_complet') THEN
        ALTER TABLE cours_vacants ADD COLUMN intitule_complet TEXT;
        RAISE NOTICE 'Colonne intitule_complet ajoutée';
    ELSE
        RAISE NOTICE 'Colonne intitule_complet existe déjà';
    END IF;
END $$;

-- Etat vacance (Etat vac.)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'etat_vacance') THEN
        ALTER TABLE cours_vacants ADD COLUMN etat_vacance VARCHAR(100);
        RAISE NOTICE 'Colonne etat_vacance ajoutée';
    ELSE
        RAISE NOTICE 'Colonne etat_vacance existe déjà';
    END IF;
END $$;

-- Cause de vacance (Cause de va)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'cause_vacance') THEN
        ALTER TABLE cours_vacants ADD COLUMN cause_vacance TEXT;
        RAISE NOTICE 'Colonne cause_vacance ajoutée';
    ELSE
        RAISE NOTICE 'Colonne cause_vacance existe déjà';
    END IF;
END $$;

-- Cause décision (Cause décis)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'cause_decision') THEN
        ALTER TABLE cours_vacants ADD COLUMN cause_decision TEXT;
        RAISE NOTICE 'Colonne cause_decision ajoutée';
    ELSE
        RAISE NOTICE 'Colonne cause_decision existe déjà';
    END IF;
END $$;

-- Date déclenchement vacance (Décl. de vac)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'date_declenchement_vacance') THEN
        ALTER TABLE cours_vacants ADD COLUMN date_declenchement_vacance DATE;
        RAISE NOTICE 'Colonne date_declenchement_vacance ajoutée';
    ELSE
        RAISE NOTICE 'Colonne date_declenchement_vacance existe déjà';
    END IF;
END $$;

-- Cours en proposition (Cours en propo.)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'cours_en_progress') THEN
        ALTER TABLE cours_vacants ADD COLUMN cours_en_progress VARCHAR(50);
        RAISE NOTICE 'Colonne cours_en_progress ajoutée';
    ELSE
        RAISE NOTICE 'Colonne cours_en_progress existe déjà';
    END IF;
END $$;

-- Volume 1 2026 (Vol1. 2026)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol_a_2026') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol_a_2026 DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol_a_2026 ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol_a_2026 existe déjà';
    END IF;
END $$;

-- Volume 1 tc (Volume 1 tc)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'volume_1_tc') THEN
        ALTER TABLE cours_vacants ADD COLUMN volume_1_tc DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne volume_1_tc ajoutée';
    ELSE
        RAISE NOTICE 'Colonne volume_1_tc existe déjà';
    END IF;
END $$;

-- Volume 2 to (Volume 2 to)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'volume_2_to') THEN
        ALTER TABLE cours_vacants ADD COLUMN volume_2_to DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne volume_2_to ajoutée';
    ELSE
        RAISE NOTICE 'Colonne volume_2_to existe déjà';
    END IF;
END $$;

-- Département Charge (Dpt Charge)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'dpt_charge') THEN
        ALTER TABLE cours_vacants ADD COLUMN dpt_charge VARCHAR(20);
        RAISE NOTICE 'Colonne dpt_charge ajoutée';
    ELSE
        RAISE NOTICE 'Colonne dpt_charge existe déjà';
    END IF;
END $$;

-- RoulType (RoulType)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'roul_type') THEN
        ALTER TABLE cours_vacants ADD COLUMN roul_type VARCHAR(50);
        RAISE NOTICE 'Colonne roul_type ajoutée';
    ELSE
        RAISE NOTICE 'Colonne roul_type existe déjà';
    END IF;
END $$;

-- Email UCL (UCL)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'email_ucl') THEN
        ALTER TABLE cours_vacants ADD COLUMN email_ucl VARCHAR(255);
        RAISE NOTICE 'Colonne email_ucl ajoutée';
    ELSE
        RAISE NOTICE 'Colonne email_ucl existe déjà';
    END IF;
END $$;

-- Vol1. Attribution (Vol1. Attrib)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol1_attrib') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol1_attrib DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol1_attrib ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol1_attrib existe déjà';
    END IF;
END $$;

-- Vol2. Attribution (Vol2. Attrib)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cours_vacants' AND column_name = 'vol2_attrib') THEN
        ALTER TABLE cours_vacants ADD COLUMN vol2_attrib DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Colonne vol2_attrib ajoutée';
    ELSE
        RAISE NOTICE 'Colonne vol2_attrib existe déjà';
    END IF;
END $$;

-- Rafraîchir le cache du schéma PostgREST
NOTIFY pgrst, 'reload schema';
