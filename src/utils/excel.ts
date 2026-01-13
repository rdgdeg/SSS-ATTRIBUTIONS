import * as XLSX from 'xlsx'

export function parseVolume(value: any): number {
  if (!value || value === '' || String(value).includes('#')) return 0
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? 0 : parsed
}

export function parseInteger(value: any): number | null {
  if (!value || value === '' || String(value).includes('#')) return null
  const parsed = parseInt(String(value))
  return isNaN(parsed) ? null : parsed
}

export function readExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheet]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  const columnVariants: Record<string, string[]> = {
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
  }

  headers.forEach((header) => {
    if (!header) return
    Object.keys(columnVariants).forEach((key) => {
      columnVariants[key].forEach((variant) => {
        if (header.trim() === variant.trim() || 
            header.toLowerCase().trim() === variant.toLowerCase().trim()) {
          mapping[key] = header
        }
      })
    })
  })

  return mapping
}
