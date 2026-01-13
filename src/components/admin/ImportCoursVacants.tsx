import { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader, FileSpreadsheet, AlertTriangle, Settings, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { readExcelFile, parseVolume, parseInteger, detectColumnMapping } from '@/utils/excel'
import { supabase } from '@/integrations/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { AppField } from '@/types'

const appFields: AppField[] = [
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
]

export default function ImportCoursVacants() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [wipeExisting, setWipeExisting] = useState(false)
  const [detectedColumns, setDetectedColumns] = useState<Record<string, string> | null>(null)
  const [showColumnMapping, setShowColumnMapping] = useState(false)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile)
      setError(null)
      setResult(null)
      
      try {
        const jsonData = await readExcelFile(selectedFile)
        if (jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]).filter(h => h)
          const autoMapping = detectColumnMapping(headers)
          setDetectedColumns(autoMapping)
          
          const initialMapping: Record<string, string> = {}
          appFields.forEach(field => {
            const autoMatch = autoMapping[field.key] || autoMapping[field.label]
            if (autoMatch) {
              initialMapping[field.key] = autoMatch
            }
          })
          setColumnMapping(initialMapping)
          
          setPreview({
            headers,
            rowCount: jsonData.length
          })
        }
      } catch (err: any) {
        console.error('Erreur prévisualisation:', err)
        setError('Erreur lors de la lecture du fichier')
      }
    } else {
      setError('Veuillez sélectionner un fichier Excel (.xlsx)')
      setFile(null)
      setPreview(null)
    }
  }

  const importData = async () => {
    if (!file) return

    setImporting(true)
    setError(null)
    setResult(null)
    setProgress({ current: 0, total: 0, message: 'Lecture du fichier Excel...' })

    try {
      const jsonData = await readExcelFile(file)
      setProgress({ current: 0, total: jsonData.length, message: 'Préparation des données...' })

      if (wipeExisting) {
        setProgress({ current: 0, total: jsonData.length, message: 'Nettoyage des données existantes...' })
        const { error: delError } = await supabase.from('cours_vacants').delete().neq('id', null)
        if (delError) throw new Error(`Erreur lors du nettoyage: ${delError.message}`)
      }

      const coursMap = new Map()
      const getMappedValue = (fieldKey: string, row: any) => {
        const mappedColumn = columnMapping[fieldKey]
        if (mappedColumn && row[mappedColumn] !== undefined) {
          return row[mappedColumn]
        }
        const autoColumn = detectedColumns?.[fieldKey] || detectedColumns?.[appFields.find(f => f.key === fieldKey)?.label || '']
        if (autoColumn && row[autoColumn] !== undefined) {
          return row[autoColumn]
        }
        return null
      }

      jsonData.forEach((row) => {
        const code = getMappedValue('code_cours', row) || row['Cours'] || ''
        if (!code || code.trim() === '') return

        if (!coursMap.has(code)) {
          coursMap.set(code, {
            code_cours: code,
            intitule_court: getMappedValue('intitule_court', row) || '',
            intitule_complet: getMappedValue('intitule_complet', row) || '',
            vol1_total: parseVolume(getMappedValue('vol1_total', row) || 0),
            vol2_total: parseVolume(getMappedValue('vol2_total', row) || 0),
            attributions: [],
            non_attribues: []
          })
        }

        const cours = coursMap.get(code)
        const nom = getMappedValue('nom', row) || row['Nom'] || ''
        const prenom = getMappedValue('prenom', row) || row['Prénom'] || ''
        const vol1 = parseVolume(getMappedValue('vol1_attrib', row) || row['Vol1. Attribution'] || 0)
        const vol2 = parseVolume(getMappedValue('vol2_attrib', row) || row['Vol2. Attribution'] || 0)

        if (nom === 'Non Attr.' || prenom === 'Non Attr.' || (!nom && !prenom && (vol1 > 0 || vol2 > 0))) {
          cours.non_attribues.push({
            vol1_non_attribue: vol1,
            vol2_non_attribue: vol2
          })
        } else if (nom || prenom || vol1 > 0 || vol2 > 0) {
          cours.attributions.push({
            nom,
            prenom,
            fonction: getMappedValue('fonction', row) || row['Fonction'] || '',
            vol1_attrib: vol1,
            vol2_attrib: vol2,
            debut: parseInteger(getMappedValue('debut', row) || row['Début']),
            duree: parseInteger(getMappedValue('duree', row) || row['Durée']),
            email_ucl: getMappedValue('email_ucl', row) || row['Email UCL'] || ''
          })
        }
      })

      const coursVacantsData = Array.from(coursMap.values())
      setProgress({ current: 0, total: coursVacantsData.length, message: `Import de ${coursVacantsData.length} cours vacants...` })

      let inserted = 0
      let updated = 0
      const errors: string[] = []

      for (let i = 0; i < coursVacantsData.length; i++) {
        const row = coursVacantsData[i]
        setProgress({ current: i + 1, total: coursVacantsData.length, message: `Import du cours ${row.code_cours}... (${i + 1}/${coursVacantsData.length})` })

        try {
          const { attributions, non_attribues, ...cleanRow } = row

          const { data: existing } = await supabase
            .from('cours_vacants')
            .select('id')
            .eq('code_cours', cleanRow.code_cours)
            .single()

          let coursId: number

          if (existing) {
            const { error: updateError } = await supabase
              .from('cours_vacants')
              .update(cleanRow)
              .eq('code_cours', cleanRow.code_cours)

            if (updateError) {
              errors.push(`Erreur MAJ ${cleanRow.code_cours}: ${updateError.message}`)
              continue
            } else {
              coursId = existing.id
              updated++
            }
          } else {
            const { data: insertedData, error: insertError } = await supabase
              .from('cours_vacants')
              .insert(cleanRow)
              .select('id')
              .single()

            if (insertError) {
              errors.push(`Erreur insertion ${cleanRow.code_cours}: ${insertError.message}`)
              continue
            } else {
              coursId = insertedData.id
              inserted++
            }
          }

          if (coursId && attributions && attributions.length > 0) {
            await supabase
              .from('cours_vacants_attributions')
              .delete()
              .eq('cours_vacant_id', coursId)

            const attributionsToInsert = attributions.map((attr: any) => ({
              cours_vacant_id: coursId,
              nom: attr.nom || null,
              prenom: attr.prenom || null,
              email_ucl: attr.email_ucl || null,
              fonction: attr.fonction || null,
              vol1_attrib: attr.vol1_attrib || 0,
              vol2_attrib: attr.vol2_attrib || 0,
              debut: attr.debut || null,
              duree: attr.duree || null
            }))

            const { error: attribError } = await supabase
              .from('cours_vacants_attributions')
              .insert(attributionsToInsert)

            if (attribError) {
              errors.push(`Erreur insertion attributions ${cleanRow.code_cours}: ${attribError.message}`)
            }
          }
        } catch (err: any) {
          errors.push(`Erreur générale ${row.code_cours}: ${err.message}`)
        }
      }

      setResult({
        success: true,
        inserted,
        updated,
        total: coursVacantsData.length,
        errors
      })

      queryClient.invalidateQueries({ queryKey: ['cours-vacants'] })
    } catch (err: any) {
      setError(`Erreur lors de l'import: ${err.message}`)
      console.error('Import error:', err)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Cours Vacants</h1>
        <p className="text-muted-foreground mt-2">
          Importez vos données de cours vacants depuis des fichiers Excel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Excel</CardTitle>
          <CardDescription>
            Sélectionnez un fichier Excel (.xlsx) pour importer les données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Fichier Excel</Label>
            <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={importing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-sm text-muted-foreground">
                  Format accepté: .xlsx (Excel)
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-muted/50 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    onClick={importData}
                    disabled={importing}
                  >
                    {importing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Importation...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Importer
                      </>
                    )}
                  </Button>
                </div>

                {preview && (
                  <div className="mt-3 p-3 bg-background rounded border">
                    <p className="text-sm font-semibold mb-2">Aperçu du fichier:</p>
                    <p className="text-xs text-muted-foreground">{preview.rowCount} lignes de données</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Colonnes détectées: {preview.headers.filter((h: string) => h).length}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wipe-existing"
                    checked={wipeExisting}
                    onChange={(e) => setWipeExisting(e.target.checked)}
                    className="h-4 w-4"
                    disabled={importing}
                  />
                  <Label htmlFor="wipe-existing" className="text-sm font-normal cursor-pointer">
                    Écraser les données existantes avant import
                  </Label>
                </div>
              </div>
            )}
          </div>

          {importing && progress.total > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Loader className="w-5 h-5 text-primary animate-spin" />
                  <span className="font-semibold">{progress.message}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-right">
                  {progress.current} / {progress.total}
                </p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <p className="font-semibold text-destructive">Erreur</p>
                </div>
                <p className="text-sm mt-2">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold">Import réussi !</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="text-3xl font-bold text-green-600">{result.inserted}</div>
                    <div className="text-sm text-muted-foreground">Cours créés</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-3xl font-bold text-blue-600">{result.updated}</div>
                    <div className="text-sm text-muted-foreground">Cours mis à jour</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-3xl font-bold text-purple-600">{result.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <div className="p-4 rounded-lg border border-destructive">
                      <div className="text-3xl font-bold text-destructive">{result.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Erreurs</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
