import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Candidature } from '@/types'

export function useCandidatures(coursVacantId?: number) {
  return useQuery({
    queryKey: ['candidatures', coursVacantId],
    queryFn: async () => {
      let query = supabase.from('candidatures').select('*')
      if (coursVacantId) {
        query = query.eq('cours_vacant_id', coursVacantId)
      }
      const { data, error } = await query.order('date_candidature', { ascending: false })
      if (error) throw error
      return data as Candidature[]
    },
    enabled: true,
  })
}

export function useCreateCandidature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (candidature: Partial<Candidature>) => {
      const { data, error } = await supabase
        .from('candidatures')
        .insert(candidature)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatures'] })
      queryClient.invalidateQueries({ queryKey: ['cours-vacants'] })
    },
  })
}

export function useUpdateCandidature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Candidature> }) => {
      const { data, error } = await supabase
        .from('candidatures')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatures'] })
      queryClient.invalidateQueries({ queryKey: ['cours-vacants'] })
    },
  })
}
