/**
 * Contact Messages Service
 * Lectura y marcado de mensajes de contacto (solo admins por RLS).
 */

import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database.types"

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']

/**
 * Lista todos los mensajes de contacto, más recientes primero.
 * La RLS restringe el SELECT a admins.
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contact messages:', error)
    throw new Error("No se pudieron cargar los mensajes de contacto")
  }

  return data
}

/**
 * Marca un mensaje de contacto como leído.
 */
export async function markContactMessageAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    .update({ status: 'read' })
    .eq('id', id)

  if (error) {
    console.error('Error marking contact message as read:', error)
    throw new Error("No se pudo marcar el mensaje como leído")
  }
}

/**
 * Cuenta los mensajes de contacto en estado 'new' (para el badge del navbar).
 */
export async function getUnreadContactCount(): Promise<number> {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  if (error) {
    console.error('Error counting unread contact messages:', error)
    return 0
  }

  return count || 0
}
