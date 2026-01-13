import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface CoursVacant {
  id?: number
  code_cours: string
  intitule_court?: string
  intitule_complet?: string
  vol1_total?: number
  vol2_total?: number
  dpt_attribution?: string
  etat_validation?: string
  [key: string]: any
}

export function useCoursVacants() {
  return useQuery({
    queryKey: ['cours-vacants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cours_vacants')
        .select('*')
        .order('code_cours', { ascending: true })

      if (error) throw error
      return data as CoursVacant[]
    },
  })
}

export function useUpdateCoursVacant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CoursVacant> }) => {
      const { data, error } = await supabase
        .from('cours_vacants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cours-vacants'] })
    },
  })
}
