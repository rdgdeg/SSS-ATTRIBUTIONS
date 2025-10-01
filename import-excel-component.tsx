import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader, FileSpreadsheet, Database } from 'lucide-react';

const SUPABASE_URL = 'https://prejgpqbjpbyfgdmglfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZWpncHFianBieWZnZG1nbGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDk0OTEsImV4cCI6MjA3NDg4NTQ5MX0.BlKuISmU3EE_zr4TY5W3JVcOtr0tg6kZ3aSngRaNVTo';

const ImportExcel = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const parseVolume = (value) => {
    if (!value || value === '' || String(value).includes('#')) {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Veuillez sélectionner un fichier Excel (.xlsx)');
      setFile(null);
    }
  };

  const importData = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0, message: 'Lecture du fichier Excel...' });

    try {
      // Lire le fichier Excel
      const data = await window.fs.readFile(file.name);
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
      const workbook = XLSX.read(data, { raw: false });
      
      const sheetName = '2025 Attributions';
      if (!workbook.Sheets[sheetName]) {
        throw new Error(`Feuille "${sheetName}" non trouvée dans le fichier Excel`);
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

      setProgress({ current: 0, total: jsonData.length, message: 'Préparation des données...' });

      // Grouper par cours
      const coursMap = new Map();
      
      jsonData.forEach((row, index) => {
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
        if (row.Enseignant || row.Fonction) {
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
        }
      });

      setProgress({ 
        current: 0, 
        total: coursMap.size, 
        message: `Import de ${coursMap.size} cours vers Supabase...` 
      });

      // Créer le client Supabase
      const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      let coursInserted = 0;
      let attribInserted = 0;
      let coursUpdated = 0;
      const errors = [];

      // Importer dans Supabase
      let current = 0;
      for (const [code, coursData] of coursMap) {
        current++;
        setProgress({ 
          current, 
          total: coursMap.size, 
          message: `Import du cours ${code}... (${current}/${coursMap.size})` 
        });

        try {
          const { attributions, ...coursToInsert } = coursData;

          // Insérer ou mettre à jour le cours
          const { data: existingCours } = await supabase
            .from('cours')
            .select('code')
            .eq('code', code)
            .single();

          if (existingCours) {
            const { error: updateError } = await supabase
              .from('cours')
              .update(coursToInsert)
              .eq('code', code);

            if (updateError) {
              errors.push(`Erreur MAJ cours ${code}: ${updateError.message}`);
              continue;
            }
            coursUpdated++;
          } else {
            const { error: insertError } = await supabase
              .from('cours')
              .insert(coursToInsert);

            if (insertError) {
              errors.push(`Erreur insertion cours ${code}: ${insertError.message}`);
              continue;
            }
            coursInserted++;
          }

          // Supprimer les anciennes attributions
          await supabase
            .from('attributions')
            .delete()
            .eq('cours_code', code);

          // Insérer les nouvelles attributions
          if (attributions.length > 0) {
            const attributionsToInsert = attributions.map(attr => ({
              cours_code: code,
              ...attr
            }));

            const { error: attrError } = await supabase
              .from('attributions')
              .insert(attributionsToInsert);

            if (attrError) {
              errors.push(`Erreur attributions ${code}: ${attrError.message}`);
            } else {
              attribInserted += attributions.length;
            }
          }
        } catch (err) {
          errors.push(`Erreur générale ${code}: ${err.message}`);
        }

        // Petite pause pour éviter de surcharger l'API
        if (current % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setResult({
        success: true,
        coursInserted,
        coursUpdated,
        attribInserted,
        errors
      });

    } catch (err) {
      setError(`Erreur lors de l'import: ${err.message}`);
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import Excel vers Supabase</h1>
              <p className="text-gray-600">Importez vos données d'attribution de cours</p>
            </div>
          </div>

          {/* Zone de sélection de fichier */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sélectionnez votre fichier Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={importing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
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
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">{file.name}</p>
                    <p className="text-sm text-blue-600">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={importData}
                  disabled={importing}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            )}
          </div>

          {/* Progression */}
          {importing && progress.total > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-semibold text-blue-900">{progress.message}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-sm text-blue-600 mt-2 text-right">
                {progress.current} / {progress.total}
              </p>
            </div>
          )}

          {/* Résultats */}
          {result && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Import réussi !</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{result.coursInserted}</div>
                  <div className="text-sm text-gray-600">Cours créés</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-blue-600">{result.coursUpdated}</div>
                  <div className="text-sm text-gray-600">Cours mis à jour</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-purple-600">{result.attribInserted}</div>
                  <div className="text-sm text-gray-600">Attributions</div>
                </div>
              </div>

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

              <button
                onClick={() => window.location.href = '/'}
                className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Voir les cours importés
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
            <h3 className="font-bold text-gray-900 mb-3">📋 Instructions</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>1. Assurez-vous que votre fichier Excel contient une feuille nommée "2025 Attributions"</li>
              <li>2. Les colonnes suivantes sont requises: Cours, Intitulé abrégé, Vol.1 Total, Vol.2 Total</li>
              <li>3. Les valeurs #VALEUR! seront automatiquement converties en 0</li>
              <li>4. Si un cours existe déjà, il sera mis à jour avec les nouvelles données</li>
              <li>5. L'import peut prendre quelques minutes selon la taille du fichier</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExcel;