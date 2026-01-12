import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, FileSpreadsheet, Database, AlertTriangle, Settings, ChevronRight, ChevronDown } from 'lucide-react';

const SUPABASE_URL = 'https://dhuuduphwvxrecfqvbbw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk';

const ImportCoursVacants = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [wipeExisting, setWipeExisting] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState(null);
  const [importWarnings, setImportWarnings] = useState([]);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  
  // Définition des champs de l'application qui doivent être mappés
  const appFields = [
    { key: 'code_cours', label: 'Code du cours', required: true, category: 'Général' },
    { key: 'intitule_court', label: 'Intitulé abrégé', required: true, category: 'Général' },
    { key: 'intitule_complet', label: 'Intitulé complet', required: false, category: 'Général' },
    { key: 'vol1_total', label: 'Volume 1 total', required: false, category: 'Volumes' },
    { key: 'vol2_total', label: 'Volume 2 total', required: false, category: 'Volumes' },
    { key: 'nom', label: 'Nom', required: false, category: 'Attribution' },
    { key: 'prenom', label: 'Prénom', required: false, category: 'Attribution' },
    { key: 'fonction', label: 'Fonction', required: false, category: 'Attribution' },
    { key: 'vol1_attrib', label: 'Vol1. Attribution', required: false, category: 'Attribution' },
    { key: 'vol2_attrib', label: 'Vol2. Attribution', required: false, category: 'Attribution' },
    { key: 'debut', label: 'Début', required: false, category: 'Attribution' },
    { key: 'duree', label: 'Durée', required: false, category: 'Attribution' },
    { key: 'email_ucl', label: 'Email UCL', required: false, category: 'Attribution' },
    { key: 'dpt_attribution', label: 'Département attribution', required: false, category: 'Général' },
    { key: 'dpt_charge', label: 'Département charge', required: false, category: 'Général' },
    { key: 'periodicite', label: 'Périodicité', required: false, category: 'Général' },
    { key: 'type_cours', label: 'Type cours', required: false, category: 'Général' },
    { key: 'etat_vacance', label: 'État vacance', required: false, category: 'Général' },
    { key: 'cause_vacance', label: 'Cause de vacance', required: false, category: 'Général' },
    { key: 'date_declenchement', label: 'Date déclenchement', required: false, category: 'Général' }
  ];

  const parseVolume = (value) => {
    if (!value || value === '' || String(value).includes('#')) {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parseInteger = (value) => {
    if (!value || value === '' || String(value).includes('#')) {
      return null;
    }
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Fonction pour détecter les colonnes avec leurs variantes possibles
  const detectColumnMapping = (headers) => {
    const mapping = {};
    const columnVariants = {
      'Cours': ['Cours', 'Code', 'Code cours'],
      'Vol1. Attribution': ['Vol1. Attribution', 'Vol1 Attribution', 'Vol.1 Attribution', 'Vol1. Attrib', 'Vol1 Attrib'],
      'Vol2. Attribution': ['Vol2. Attribution', 'Vol2 Attribution', 'Vol.2 Attribution', 'Vol2. Attrib', 'Vol2 Attrib'],
      'Nom': ['Nom'],
      'Prénom': ['Prénom', 'Prenom'],
      'Fonction': ['Fonction', 'Foncti'],
      'Début': ['Début', 'Debut'],
      'Durée': ['Durée', 'Duree'],
      'Email UCL': ['Email UCL', 'Email UCL', 'UCL'],
      'Volume 1 total': ['Volume 1 total', 'Volume 1 Total', 'Vol.1 Total', 'Vol1 Total'],
      'Volume 2 total': ['Volume 2 total', 'Volume 2 Total', 'Vol.2 Total', 'Vol2 Total']
    };

    headers.forEach((header, index) => {
      if (!header) return;
      
      Object.keys(columnVariants).forEach(key => {
        columnVariants[key].forEach(variant => {
          if (header.trim() === variant.trim() || 
              header.toLowerCase().trim() === variant.toLowerCase().trim()) {
            mapping[key] = header;
          }
        });
      });
    });

    return mapping;
  };

  // Fonction pour trouver une colonne avec plusieurs variantes
  const findColumn = (row, variants) => {
    for (const variant of variants) {
      if (row[variant] !== undefined && row[variant] !== '') {
        return row[variant];
      }
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      
      // Prévisualisation du fichier
      try {
        if (!window.XLSX) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          document.head.appendChild(script);
          await new Promise((resolve) => { script.onload = resolve; });
        }

        const fileData = await selectedFile.arrayBuffer();
        const workbook = window.XLSX.read(fileData, { raw: false });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const data = window.XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '', header: 1 });
        
        if (data.length > 0) {
          const headers = data[0].filter(h => h); // Filtrer les colonnes vides
          // Détecter les colonnes importantes avec leurs variantes
          const autoMapping = detectColumnMapping(headers);
          setDetectedColumns(autoMapping);
          
          // Initialiser le mapping avec la détection automatique
          const initialMapping = {};
          appFields.forEach(field => {
            // Chercher une correspondance automatique
            const autoMatch = autoMapping[field.key] || autoMapping[field.label];
            if (autoMatch) {
              initialMapping[field.key] = autoMatch;
            } else {
              // Essayer de trouver une correspondance par nom similaire
              const similar = headers.find(h => 
                h && (
                  h.toLowerCase().includes(field.label.toLowerCase().substring(0, 5)) ||
                  field.label.toLowerCase().includes(h.toLowerCase().substring(0, 5))
                )
              );
              if (similar) {
                initialMapping[field.key] = similar;
              }
            }
          });
          setColumnMapping(initialMapping);
          
          setPreview({
            sheetName: firstSheet,
            headers: headers,
            rowCount: data.length - 1
          });
        }
      } catch (err) {
        console.error('Erreur prévisualisation:', err);
      }
    } else {
      setError('Veuillez sélectionner un fichier Excel (.xlsx)');
      setFile(null);
      setPreview(null);
    }
  };

  const importData = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0, message: 'Lecture du fichier Excel...' });

    try {
      // Charger XLSX si nécessaire
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        document.head.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const fileData = await file.arrayBuffer();
      const workbook = window.XLSX.read(fileData, { raw: false });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

      // Log pour debug
      console.log('📊 Import Excel - Informations:', {
        nombreLignes: jsonData.length,
        premiereLigne: jsonData[0],
        colonnes: Object.keys(jsonData[0] || {})
      });

      setProgress({ current: 0, total: jsonData.length, message: 'Préparation des données...' });

      // Créer le client Supabase
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      // Option : écraser les données existantes
      if (wipeExisting) {
        setProgress({ current: 0, total: jsonData.length, message: 'Nettoyage des données existantes...' });
        const { error: delError } = await supabase.from('cours_vacants').delete().neq('id', null);
        if (delError) {
          throw new Error(`Erreur lors du nettoyage: ${delError.message}`);
        }
      }

      // Grouper par cours (une ligne = une attribution ou "Non Attr.")
      const coursMap = new Map();
      
      // Afficher les colonnes détectées pour debug
      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const allColumns = Object.keys(firstRow);
        console.log('📋 Colonnes détectées dans Excel:', allColumns);
        console.log('🔍 Mapping des colonnes importantes:', detectedColumns);
        
        // Vérifier les colonnes critiques
        const criticalColumns = ['Vol1. Attribution', 'Vol2. Attribution', 'Nom', 'Prénom', 'Fonction'];
        const missingColumns = [];
        criticalColumns.forEach(col => {
          const found = allColumns.some(c => 
            c === col || 
            c.toLowerCase().includes(col.toLowerCase().replace(/[.\s]/g, '')) ||
            detectedColumns?.[col]
          );
          if (!found) {
            missingColumns.push(col);
          }
        });
        
        if (missingColumns.length > 0) {
          setImportWarnings(prev => [...prev, 
            `⚠️ Colonnes non trouvées: ${missingColumns.join(', ')}. Vérifiez les noms dans votre Excel.`
          ]);
        }
      }

      // Utiliser le mapping personnalisé ou la détection automatique
      const getMappedValue = (fieldKey, row) => {
        const mappedColumn = columnMapping[fieldKey];
        if (mappedColumn && row[mappedColumn] !== undefined) {
          return row[mappedColumn];
        }
        // Fallback sur la détection automatique
        const autoColumn = detectedColumns?.[fieldKey] || detectedColumns?.[appFields.find(f => f.key === fieldKey)?.label];
        if (autoColumn && row[autoColumn] !== undefined) {
          return row[autoColumn];
        }
        return null;
      };

      jsonData.forEach((row, index) => {
        // Utiliser le mapping pour trouver le code du cours
        const code = getMappedValue('code_cours', row) || 
                     findColumn(row, ['Cours', 'Code', 'Code cours', ...Object.keys(row).filter(k => k.toLowerCase().includes('cours'))]) || '';
        
        if (!code || code.trim() === '') return;

        // Si c'est la première ligne de ce cours, créer l'entrée du cours
        if (!coursMap.has(code)) {
          coursMap.set(code, {
            // Utiliser le mapping pour tous les champs
            sigle: getMappedValue('sigle', row) || '',
            cnum: parseInteger(getMappedValue('cnum', row)),
            code_cours: code,
            intitule: getMappedValue('intitule_court', row) || '',
            intitule_court: getMappedValue('intitule_court', row) || '',
            intitule_complet: getMappedValue('intitule_complet', row) || '',
            inactif: getMappedValue('inactif', row) || false,
            etat_validation: getMappedValue('etat_vacance', row) || '',
            etat_vacance: getMappedValue('etat_vacance', row) || '',
            // Causes
            cause_vacance: getMappedValue('cause_vacance', row) || '',
            cause_decision: getMappedValue('cause_decision', row) || '',
            cause_1: getMappedValue('cause_vacance', row) || '',
            cause_2: getMappedValue('cause_decision', row) || '',
            // Dates
            date_declenchement: getMappedValue('date_declenchement', row) || '',
            date_declenchement_vacance: getMappedValue('date_declenchement', row) || '',
            cours_associe: getMappedValue('cours_en_progress', row) || '',
            cours_en_progress: getMappedValue('cours_en_progress', row) || '',
            // Volumes et coefficients - utiliser le mapping
            vol1_total: parseVolume(getMappedValue('vol1_total', row) || 0),
            vol2_total: parseVolume(getMappedValue('vol2_total', row) || 0),
            vol1_cours: parseVolume(getMappedValue('vol1_cours', row) || 0),
            vol2_cours: parseVolume(getMappedValue('vol2_cours', row) || 0),
            vol_a_2026: parseVolume(getMappedValue('vol1_cours', row) || 0),
            volume_1: parseVolume(getMappedValue('vol1_total', row) || 0),
            volume_2: parseVolume(getMappedValue('vol2_total', row) || 0),
            volume_1_tc: parseVolume(getMappedValue('vol1_total', row) || 0),
            volume_2_to: parseVolume(getMappedValue('vol2_total', row) || 0),
            coef1: parseVolume(getMappedValue('coef1', row) || 0),
            coef2: parseVolume(getMappedValue('coef2', row) || 0),
            // Périodicité et départements
            periodicite: getMappedValue('periodicite', row) || '',
            dpt_client: getMappedValue('dpt_client', row) || '',
            dpt_charge: getMappedValue('dpt_charge', row) || '',
            dpt_attribution: getMappedValue('dpt_attribution', row) || '',
            type_cours: getMappedValue('type_cours', row) || '',
            roul_type: getMappedValue('roul_type', row) || '',
            attributions: [],
            non_attribues: []
          });
        }

        const cours = coursMap.get(code);
        
        // Utiliser le mapping personnalisé pour récupérer les valeurs
        const nom = getMappedValue('nom', row) || '';
        const prenom = getMappedValue('prenom', row) || '';
        const fonction = getMappedValue('fonction', row) || '';
        const vol1_attrib = parseVolume(getMappedValue('vol1_attrib', row) || 0);
        const vol2_attrib = parseVolume(getMappedValue('vol2_attrib', row) || 0);
        
        // Gérer "Non Attr." comme une attribution vacante
        const isNonAttribue = (nom && (nom.toString().toLowerCase().includes('non attr') || 
                                       nom.toString().toLowerCase().includes('non attrib'))) ||
                              (prenom && (prenom.toString().toLowerCase().includes('non attr') || 
                                         prenom.toString().toLowerCase().includes('non attrib')));
        
        // Log pour debug si volumes trouvés
        if (vol1_attrib > 0 || vol2_attrib > 0) {
          console.log(`📊 Cours ${code}: Vol1=${vol1_attrib}, Vol2=${vol2_attrib}, Nom=${nom}, Prénom=${prenom}, Fonction=${fonction}, NonAttribué=${isNonAttribue}`);
        }
        
        // Vérifier si c'est une ligne avec attribution (si nom/prénom/fonction ou volumes d'attribution)
        const hasAttribution = (!isNonAttribue && ((nom && nom.trim() !== '') || 
                              (prenom && prenom.trim() !== '') || 
                              (fonction && fonction.trim() !== '') ||
                              vol1_attrib > 0 || 
                              vol2_attrib > 0));
        
        // Si c'est "Non Attr.", traiter comme non attribué
        if (isNonAttribue && (vol1_attrib > 0 || vol2_attrib > 0)) {
          cours.non_attribues.push({
            vol1_non_attribue: vol1_attrib,
            vol2_non_attribue: vol2_attrib,
            cause: getMappedValue('cause_vacance', row) || '',
            remarque: ''
          });
        } else if (hasAttribution) {
          // Attribution normale - récupérer tous les champs Excel
          // Récupérer tous les champs avec le mapping personnalisé
          const matricule = getMappedValue('matricule', row) || '';
          const date_naissance = getMappedValue('date_naissance', row) || '';
          const email_ucl = getMappedValue('email_ucl', row) || '';
          const supplement = getMappedValue('supplement', row) || '';
          const debut = parseInteger(getMappedValue('debut', row));
          const duree = parseInteger(getMappedValue('duree', row));
          
          cours.attributions.push({
            nom: nom,
            prenom: prenom,
            matricule: matricule,
            date_naissance: date_naissance,
            email: '',
            email_ucl: email_ucl,
            fonction: fonction,
            supplement: supplement,
            debut: debut,
            duree: duree,
            vol1_enseignant: vol1_attrib,
            vol2_enseignant: vol2_attrib,
            vol1_attrib: vol1_attrib,
            vol2_attrib: vol2_attrib,
            mode_paiement: '',
            poste: '',
            remarque: '',
            remarque_speciale: '',
            procedure: '',
            id_equipe: '',
            candidat: '',
            cause_1: findColumn(row, ['Cause de vac.', 'Cause de vac', ...Object.keys(row).filter(k => k.toLowerCase().includes('cause'))]) || '',
            cause_2: findColumn(row, ['Cause décision', 'Cause decision', ...Object.keys(row).filter(k => k.toLowerCase().includes('cause') && k.toLowerCase().includes('décis'))]) || ''
          });
        } else if (vol1_attrib > 0 || vol2_attrib > 0) {
          // Ligne avec volumes mais sans attribution (non attribué)
          cours.non_attribues.push({
            vol1_non_attribue: vol1_attrib,
            vol2_non_attribue: vol2_attrib,
            cause: row['Cause de vac.'] || '',
            remarque: ''
          });
        }
      });

      // Convertir en tableau pour l'affichage et le stockage
      // Pour chaque cours, prendre la première attribution pour les champs de personne
      const coursVacantsData = Array.from(coursMap.values()).map(cours => {
        // Calculer les volumes attribués (utiliser vol1_attrib et vol2_attrib)
        const vol1_attribue = cours.attributions.reduce((sum, a) => sum + (a.vol1_attrib || a.vol1_enseignant || 0), 0);
        const vol2_attribue = cours.attributions.reduce((sum, a) => sum + (a.vol2_attrib || a.vol2_enseignant || 0), 0);
        
        // Calculer les volumes non attribués
        const vol1_non_attribue = cours.non_attribues.reduce((sum, na) => sum + (na.vol1_non_attribue || 0), 0);
        const vol2_non_attribue = cours.non_attribues.reduce((sum, na) => sum + (na.vol2_non_attribue || 0), 0);
        
        // Prendre la première attribution pour les champs de personne (si disponible)
        const firstAttribution = cours.attributions.length > 0 ? cours.attributions[0] : null;
        
        // Calculer les volumes d'attribution totaux
        const vol1_attrib_total = cours.attributions.reduce((sum, a) => sum + (a.vol1_attrib || 0), 0);
        const vol2_attrib_total = cours.attributions.reduce((sum, a) => sum + (a.vol2_attrib || 0), 0);
        
        // Validation des volumes : vérifier que la somme des attributions + non attribués = totaux
        const vol1_total_calcule = vol1_attribue + vol1_non_attribue;
        const vol2_total_calcule = vol2_attribue + vol2_non_attribue;
        const vol1_ecart = Math.abs((cours.vol1_total || 0) - vol1_total_calcule);
        const vol2_ecart = Math.abs((cours.vol2_total || 0) - vol2_total_calcule);
        const volumes_valides = vol1_ecart < 0.01 && vol2_ecart < 0.01;
        
        // Si les volumes ne correspondent pas, ajouter un avertissement
        if (!volumes_valides && (cours.vol1_total > 0 || cours.vol2_total > 0)) {
          console.warn(`⚠️ Cours ${cours.code_cours}: Écart de volumes détecté`, {
            vol1_total: cours.vol1_total,
            vol1_attribue,
            vol1_non_attribue,
            vol1_total_calcule,
            vol1_ecart,
            vol2_total: cours.vol2_total,
            vol2_attribue,
            vol2_non_attribue,
            vol2_total_calcule,
            vol2_ecart
          });
        }
        
        return {
          ...cours,
          // Informations personne (de la première attribution)
          nom: firstAttribution?.nom || '',
          prenom: firstAttribution?.prenom || '',
          matricule: firstAttribution?.matricule || '',
          date_naissance: firstAttribution?.date_naissance || '',
          email: firstAttribution?.email || '',
          email_ucl: firstAttribution?.email_ucl || '',
          fonction: firstAttribution?.fonction || '',
          supplement: firstAttribution?.supplement || '',
          // Attribution (de la première attribution)
          debut: firstAttribution?.debut || null,
          duree: firstAttribution?.duree || null,
          vol1_enseignant: vol1_attrib_total, // Total des volumes attribués
          vol2_enseignant: vol2_attrib_total, // Total des volumes attribués
          vol1_attrib: vol1_attrib_total,
          vol2_attrib: vol2_attrib_total,
          mode_paiement: firstAttribution?.mode_paiement || '',
          poste: firstAttribution?.poste || '',
          // Causes d'attribution (de la première attribution si disponible, sinon du cours)
          cause_1: firstAttribution?.cause_1 || cours.cause_1 || '',
          cause_2: firstAttribution?.cause_2 || cours.cause_2 || '',
          // Remarques (de la première attribution)
          remarque: firstAttribution?.remarque || '',
          remarque_speciale: firstAttribution?.remarque_speciale || '',
          procedure: firstAttribution?.procedure || '',
          candidat: firstAttribution?.candidat || '',
          id_equipe: firstAttribution?.id_equipe || '',
          // Calculs
          vol1_attribue,
          vol2_attribue,
          vol1_non_attribue,
          vol2_non_attribue,
          vol1_restant: (cours.vol1_total || 0) - vol1_attribue - vol1_non_attribue,
          vol2_restant: (cours.vol2_total || 0) - vol2_attribue - vol2_non_attribue,
          est_vacant: vol1_non_attribue > 0 || vol2_non_attribue > 0 || 
                     (cours.vol1_total > 0 && vol1_attribue < cours.vol1_total) ||
                     (cours.vol2_total > 0 && vol2_attribue < cours.vol2_total),
          // Validation des volumes
          volumes_valides,
          vol1_ecart,
          vol2_ecart,
          vol1_total_calcule,
          vol2_total_calcule
        };
      });

      setProgress({ 
        current: 0, 
        total: coursVacantsData.length, 
        message: `Import de ${coursVacantsData.length} cours vacants vers Supabase...` 
      });

      let inserted = 0;
      let updated = 0;
      const errors = [];

      // Importer dans Supabase
      for (let i = 0; i < coursVacantsData.length; i++) {
        const row = coursVacantsData[i];
        setProgress({ 
          current: i + 1, 
          total: coursVacantsData.length, 
          message: `Import du cours ${row.code_cours}... (${i + 1}/${coursVacantsData.length})` 
        });

        try {
          // Nettoyer les données : supprimer les champs qui ne sont pas dans la base de données
          const {
            attributions,
            non_attribues,
            vol1_attribue,
            vol2_attribue,
            vol1_restant,
            vol2_restant,
            est_vacant,
            ...cleanRow
          } = row;

          // Convertir les valeurs vides en null pour les champs numériques
          const cleanedRow = Object.keys(cleanRow).reduce((acc, key) => {
            const value = cleanRow[key];
            // Si c'est un nombre et que la valeur est vide ou 0, mettre null pour les champs optionnels
            if (typeof value === 'number' && (value === 0 || isNaN(value))) {
              // Garder 0 pour les volumes par défaut, null pour les autres
              if (key.includes('vol') || key.includes('coef')) {
                acc[key] = value;
              } else {
                acc[key] = null;
              }
            } else if (value === '' || value === undefined) {
              acc[key] = null;
            } else {
              acc[key] = value;
            }
            return acc;
          }, {});

          // Vérifier si le cours existe déjà
          const { data: existing } = await supabase
            .from('cours_vacants')
            .select('id')
            .eq('code_cours', cleanedRow.code_cours)
            .single();

          let coursId;

          if (existing) {
            // Mettre à jour
            const { error: updateError } = await supabase
              .from('cours_vacants')
              .update(cleanedRow)
              .eq('code_cours', cleanedRow.code_cours);

            if (updateError) {
              errors.push(`Erreur MAJ ${cleanedRow.code_cours}: ${updateError.message}`);
              continue;
            } else {
              coursId = existing.id;
              updated++;
            }
          } else {
            // Insérer
            const { data: insertedData, error: insertError } = await supabase
              .from('cours_vacants')
              .insert(cleanedRow)
              .select('id')
              .single();

            if (insertError) {
              errors.push(`Erreur insertion ${cleanedRow.code_cours}: ${insertError.message}`);
              continue;
            } else {
              coursId = insertedData.id;
              inserted++;
            }
          }

          // Sauvegarder toutes les attributions dans la table séparée
          if (coursId && attributions && attributions.length > 0) {
            // Supprimer les anciennes attributions
            const { error: deleteError } = await supabase
              .from('cours_vacants_attributions')
              .delete()
              .eq('cours_vacant_id', coursId);

            if (deleteError) {
              console.warn(`⚠️ Erreur suppression anciennes attributions pour ${cleanedRow.code_cours}:`, deleteError);
            }

            // Préparer les attributions pour l'insertion
            const attributionsToInsert = attributions.map(attr => ({
              cours_vacant_id: coursId,
              nom: attr.nom || null,
              prenom: attr.prenom || null,
              matricule: attr.matricule || null,
              date_naissance: attr.date_naissance || null,
              email_ucl: attr.email_ucl || null,
              fonction: attr.fonction || null,
              supplement: attr.supplement || null,
              debut: attr.debut || null,
              duree: attr.duree || null,
              vol1_attrib: attr.vol1_attrib || 0,
              vol2_attrib: attr.vol2_attrib || 0,
              mode_paiement: attr.mode_paiement || null,
              poste: attr.poste || null,
              remarque: attr.remarque || null,
              cause_1: attr.cause_1 || null,
              cause_2: attr.cause_2 || null
            }));

            // Log pour debug
            console.log(`📝 Cours ${cleanedRow.code_cours}: ${attributionsToInsert.length} attribution(s) à insérer`, {
              attributions: attributionsToInsert.map(a => ({
                nom: a.nom,
                prenom: a.prenom,
                fonction: a.fonction,
                vol1: a.vol1_attrib,
                vol2: a.vol2_attrib
              }))
            });

            // Insérer les attributions
            const { data: insertedAttribs, error: attribError } = await supabase
              .from('cours_vacants_attributions')
              .insert(attributionsToInsert)
              .select();

            if (attribError) {
              const errorMsg = `Erreur insertion attributions ${cleanedRow.code_cours}: ${attribError.message}`;
              errors.push(errorMsg);
              console.error('❌', errorMsg, attribError);
            } else {
              console.log(`✅ ${insertedAttribs?.length || 0} attribution(s) insérée(s) pour ${cleanedRow.code_cours}`);
            }
          } else if (attributions && attributions.length === 0) {
            console.log(`ℹ️ Cours ${cleanedRow.code_cours}: Aucune attribution à sauvegarder`);
          }
        } catch (err) {
          errors.push(`Erreur générale ${row.code_cours}: ${err.message}`);
        }

        // Petite pause pour éviter de surcharger l'API
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Statistiques sur les attributions
      const totalAttributions = coursVacantsData.reduce((sum, c) => sum + (c.attributions?.length || 0), 0);
      const coursAvecAttributions = coursVacantsData.filter(c => c.attributions?.length > 0).length;
      const totalVol1Attrib = coursVacantsData.reduce((sum, c) => {
        return sum + (c.attributions?.reduce((s, a) => s + (a.vol1_attrib || 0), 0) || 0);
      }, 0);
      const totalVol2Attrib = coursVacantsData.reduce((sum, c) => {
        return sum + (c.attributions?.reduce((s, a) => s + (a.vol2_attrib || 0), 0) || 0);
      }, 0);
      
      // Statistiques sur la validation des volumes
      const coursAvecVolumesInvalides = coursVacantsData.filter(c => !c.volumes_valides && (c.vol1_total > 0 || c.vol2_total > 0)).length;
      
      console.log('📊 Résumé de l\'import:', {
        coursTotal: coursVacantsData.length,
        coursAvecAttributions,
        totalAttributions,
        totalVol1Attrib,
        totalVol2Attrib
      });
      
      setResult({
        success: true,
        inserted,
        updated,
        total: coursVacantsData.length,
        errors,
        totalAttributions,
        coursAvecAttributions,
        totalVol1Attrib,
        totalVol2Attrib,
        coursAvecVolumesInvalides,
        warnings: importWarnings
      });

    } catch (err) {
      setError(`Erreur lors de l'import: ${err.message}`);
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import Cours Vacants</h1>
              <p className="text-gray-600">Importez vos données de cours vacants depuis Excel</p>
            </div>
          </div>

          {/* Zone de sélection de fichier */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sélectionnez votre fichier Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-vacants"
                disabled={importing}
              />
              <label htmlFor="file-upload-vacants" className="cursor-pointer">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-sm text-gray-500">
                  Format accepté: .xlsx (Excel)
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">{file.name}</p>
                      <p className="text-sm text-orange-600">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={importData}
                    disabled={importing}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Importation...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Importer
                      </>
                    )}
                  </button>
                </div>

                {preview && (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-white rounded border border-orange-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Aperçu du fichier:</p>
                      <p className="text-xs text-gray-600">Feuille: <span className="font-mono">{preview.sheetName}</span></p>
                      <p className="text-xs text-gray-600">{preview.rowCount} lignes de données</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Colonnes détectées: {preview.headers.filter(h => h).length}
                      </p>
                      {preview.headers.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-orange-600 cursor-pointer hover:text-orange-700">
                            Voir toutes les colonnes détectées
                          </summary>
                          <div className="mt-2 max-h-32 overflow-y-auto text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded">
                            {preview.headers.filter(h => h).join(', ')}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Interface de mapping des colonnes */}
                    <div className="bg-white rounded-lg border-2 border-indigo-200 shadow-sm">
                      <button
                        onClick={() => setShowColumnMapping(!showColumnMapping)}
                        className="w-full p-4 flex items-center justify-between hover:bg-indigo-50 transition-colors rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Settings className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900">Configuration du mapping des colonnes</h3>
                            <p className="text-xs text-gray-500">Liez les colonnes Excel aux champs de l'application</p>
                          </div>
                        </div>
                        {showColumnMapping ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {showColumnMapping && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-800">
                              <strong>💡 Astuce :</strong> Sélectionnez manuellement les colonnes Excel qui correspondent à chaque champ de l'application. 
                              Le système essaie de détecter automatiquement, mais vous pouvez ajuster si nécessaire.
                            </p>
                          </div>
                          
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {Object.entries(
                              appFields.reduce((acc, field) => {
                                if (!acc[field.category]) acc[field.category] = [];
                                acc[field.category].push(field);
                                return acc;
                              }, {})
                            ).map(([category, fields]) => (
                              <div key={category} className="border border-gray-200 rounded-lg p-3">
                                <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                                  {category}
                                </h4>
                                <div className="space-y-2">
                                  {fields.map(field => (
                                    <div key={field.key} className="flex items-center gap-3">
                                      <label className="flex-1 text-sm text-gray-700 min-w-[200px]">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                      <select
                                        value={columnMapping[field.key] || ''}
                                        onChange={(e) => setColumnMapping({
                                          ...columnMapping,
                                          [field.key]: e.target.value || null
                                        })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      >
                                        <option value="">-- Sélectionner une colonne --</option>
                                        {preview.headers.filter(h => h).map(header => (
                                          <option key={header} value={header}>
                                            {header}
                                          </option>
                                        ))}
                                      </select>
                                      {columnMapping[field.key] && (
                                        <span className="text-xs text-green-600 font-medium">✓</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={wipeExisting}
                    onChange={(e) => setWipeExisting(e.target.checked)}
                    className="h-4 w-4"
                    disabled={importing}
                  />
                  Écraser les données existantes avant import
                </label>
              </div>
            )}
          </div>

          {/* Progression */}
          {importing && progress.total > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader className="w-5 h-5 text-orange-600 animate-spin" />
                <span className="font-semibold text-orange-900">{progress.message}</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-600 to-red-600 h-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-orange-600 mt-2 text-right">
                {progress.current} / {progress.total}
              </p>
            </div>
          )}

          {/* Avertissements de colonnes */}
          {importWarnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Avertissements</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                {importWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Colonnes détectées */}
          {detectedColumns && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Colonnes détectées dans votre fichier</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800">
                {Object.entries(detectedColumns).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> <span className="font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Résultats */}
          {result && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Import réussi !</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{result.inserted}</div>
                  <div className="text-sm text-gray-600">Cours créés</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-blue-600">{result.updated}</div>
                  <div className="text-sm text-gray-600">Cours mis à jour</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-purple-600">{result.totalAttributions || 0}</div>
                  <div className="text-sm text-gray-600">Attributions</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-indigo-600">{result.coursAvecAttributions || 0}</div>
                  <div className="text-sm text-gray-600">Cours avec attributions</div>
                </div>
              </div>

              {/* Résumé des attributions */}
              {result.totalAttributions > 0 ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mb-4">
                  <p className="font-semibold text-indigo-900 mb-2">
                    📊 Résumé des attributions importées
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="font-bold text-indigo-800">{result.totalAttributions}</div>
                      <div className="text-xs text-indigo-600">Attribution(s)</div>
                    </div>
                    <div>
                      <div className="font-bold text-indigo-800">{result.coursAvecAttributions}</div>
                      <div className="text-xs text-indigo-600">Cours avec attributions</div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-700">{result.totalVol1Attrib?.toFixed(1) || 0}h</div>
                      <div className="text-xs text-indigo-600">Total Vol1. Attribution</div>
                    </div>
                    <div>
                      <div className="font-bold text-orange-700">{result.totalVol2Attrib?.toFixed(1) || 0}h</div>
                      <div className="text-xs text-indigo-600">Total Vol2. Attribution</div>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-600 mt-2">
                    Vérifiez le tableau "Membres du cours" dans les détails de chaque cours pour voir toutes les attributions
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="font-semibold text-yellow-900 mb-1">
                    ⚠️ Aucune attribution trouvée
                  </p>
                  <p className="text-xs text-yellow-800">
                    Vérifiez que votre fichier Excel contient les colonnes "Vol1. Attribution" et "Vol2. Attribution" avec des valeurs > 0, 
                    ou que les colonnes "Nom", "Prénom" ou "Fonction" sont remplies.
                  </p>
                </div>
              )}

              {/* Validation des volumes */}
              {result.coursAvecVolumesInvalides > 0 && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <p className="font-semibold text-orange-900">
                      ⚠️ Validation des volumes
                    </p>
                  </div>
                  <p className="text-sm text-orange-800 mb-1">
                    <strong>{result.coursAvecVolumesInvalides}</strong> cours avec des écarts entre les volumes totaux et la somme des attributions
                  </p>
                  <p className="text-xs text-orange-700">
                    Vérifiez dans la console (F12) les détails pour chaque cours concerné. 
                    La somme des volumes attribués + non attribués doit correspondre aux volumes totaux.
                  </p>
                </div>
              )}

              {result.warnings && result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  <p className="font-semibold text-yellow-900 mb-2">
                    ⚠️ Avertissements:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3">
                  <p className="font-semibold text-orange-900 mb-2">
                    ⚠️ {result.errors.length} erreur(s) rencontrée(s):
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {result.errors.slice(0, 10).map((err, idx) => (
                      <p key={idx} className="text-sm text-orange-700">• {err}</p>
                    ))}
                    {result.errors.length > 10 && (
                      <p className="text-sm text-orange-600 mt-2">
                        ... et {result.errors.length - 10} autre(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Message d'aide pour vérifier l'import */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                <p className="text-xs text-blue-800">
                  <strong>💡 Pour vérifier que l'import s'est bien passé :</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Ouvrez la console du navigateur (F12) pour voir les détails de l'import</li>
                  <li>Vérifiez que les volumes d'attribution (Vol1. Attribution, Vol2. Attribution) sont bien importés</li>
                  <li>Consultez le tableau "Membres du cours" dans les détails de chaque cours</li>
                  <li>Si les volumes sont à 0, vérifiez que les colonnes Excel s'appellent bien "Vol1. Attribution" et "Vol2. Attribution"</li>
                </ul>
              </div>

              <button
                onClick={() => window.location.href = '/cours-vacants'}
                className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Voir les cours vacants importés
              </button>
            </div>
          )}

          {/* Erreurs */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Erreur</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">📋 Colonnes attendues dans le fichier Excel</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">⚠️ Colonnes critiques pour les attributions :</p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Vol1. Attribution</strong> - Volume 1 attribué à la personne</li>
                <li><strong>Vol2. Attribution</strong> - Volume 2 attribué à la personne</li>
                <li><strong>Nom</strong> - Nom de la personne</li>
                <li><strong>Prénom</strong> - Prénom de la personne</li>
                <li><strong>Fonction</strong> - Fonction (Coordinateur, Cotitulaire, etc.)</li>
                <li><strong>Début</strong> - Année de début d'attribution</li>
                <li><strong>Durée</strong> - Durée en années</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
              <div>• Sigle</div>
              <div>• Cnum</div>
              <div>• Cours</div>
              <div>• Intitulé abrégé</div>
              <div>• Intit.Complet</div>
              <div>• Inactif</div>
              <div>• Etat vac.</div>
              <div>• Cause de vac.</div>
              <div>• Cause décision</div>
              <div>• Décl. de vac.</div>
              <div>• Cours en propo.</div>
              <div>• Vol1. 2026</div>
              <div>• Vol2.</div>
              <div>• Coef1</div>
              <div>• Coef2</div>
              <div>• Volume 1 total</div>
              <div>• Volume 2 total</div>
              <div>• Périodicité</div>
              <div>• Dpt Charge</div>
              <div>• Dpt Attribution</div>
              <div>• Type</div>
              <div>• Nom</div>
              <div>• Prénom</div>
              <div>• Matricule</div>
              <div>• Date naissance</div>
              <div>• Email UCL</div>
              <div>• Fonction</div>
              <div>• Supplée</div>
              <div>• Début</div>
              <div>• Durée</div>
              <div>• <strong>Vol1. Attribution</strong></div>
              <div>• <strong>Vol2. Attribution</strong></div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-semibold text-yellow-900 mb-1">💡 Conseils pour un import réussi :</p>
              <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                <li>Assurez-vous que les colonnes "Vol1. Attribution" et "Vol2. Attribution" existent dans votre Excel</li>
                <li>Chaque ligne avec un Nom/Prénom/Fonction ou des volumes d'attribution > 0 créera une attribution</li>
                <li>Les volumes doivent être des nombres (ex: 15, 20.5, etc.)</li>
                <li>Vérifiez la console du navigateur (F12) pour voir les détails de l'import</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCoursVacants;
