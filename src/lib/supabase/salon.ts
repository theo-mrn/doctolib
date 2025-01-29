import { supabase } from '@/lib/supabase'
import type { Salon } from '@/types/salon'

export async function updateSalon(id: number, data: Partial<Salon>) {
  try {
    const { error } = await supabase
      .from('salons')
      .update(data)
      .eq('id', id)

    if (error) throw error

    return { success: true, message: 'Salon mis à jour avec succès' }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du salon'
    }
  }
}
