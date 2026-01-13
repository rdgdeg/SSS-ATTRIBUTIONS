export interface CoursVacant {
  id?: number
  code_cours: string
  intitule_court?: string
  intitule_complet?: string
  vol1_total?: number
  vol2_total?: number
  dpt_attribution?: string
  etat_validation?: string
  candidat?: string
  [key: string]: any
}

export interface Attribution {
  id?: number
  cours_vacant_id?: number
  nom?: string
  prenom?: string
  matricule?: string
  email_ucl?: string
  fonction?: string
  vol1_attrib?: number
  vol2_attrib?: number
  debut?: number
  duree?: number
  [key: string]: any
}

export interface AppField {
  key: string
  label: string
  required: boolean
  category: string
}

export interface Candidature {
  id?: number
  cours_vacant_id: number
  nom?: string
  prenom?: string
  email?: string
  statut?: string
  date_candidature?: string
  [key: string]: any
}
