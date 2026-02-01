/**
 * Tutoring Messages Service
 * Handles all messaging functionality for tutoring sessions
 */

import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database.types"

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

// Extended types with user info
export interface MessageWithSender extends Message {
  sender: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export interface ConversationGroup {
  participant: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  lastMessage: MessageWithSender
  unreadCount: number
  sessionId: string
  sessionTitle: string
}

/**
 * T045: Send a message for a tutoring session
 */
export async function sendTutoringMessage(params: {
  tutoring_session_id?: string | null
  sender_id: string
  recipient_id: string
  content: string
  images?: string[]
}): Promise<Message> {
  const { tutoring_session_id, sender_id, recipient_id, content, images } = params

  // Validate sender != recipient
  if (sender_id === recipient_id) {
    throw new Error("No puedes enviarte mensajes a ti mismo")
  }

  // Validate content is not empty
  if (!content.trim()) {
    throw new Error("El mensaje no puede estar vacío")
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      tutoring_session_id: tutoring_session_id || null,
      sender_id,
      recipient_id,
      content: content.trim(),
      images: images || null,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw new Error("No se pudo enviar el mensaje")
  }

  return data
}

/**
 * T046: Get messages for a conversation (between two users for a session)
 */
export async function getTutoringMessages(params: {
  tutoring_session_id?: string
  user_id: string
  other_user_id: string
  limit?: number
  offset?: number
}): Promise<MessageWithSender[]> {
  const { tutoring_session_id, user_id, other_user_id, limit = 50, offset = 0 } = params

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .is('product_id', null)
    .or(`and(sender_id.eq.${user_id},recipient_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},recipient_id.eq.${user_id})`)

  // Solo filtrar por sesión si se proporciona
  if (tutoring_session_id) {
    query = query.eq('tutoring_session_id', tutoring_session_id)
  }

  const { data, error } = await query
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching messages:', error)
    throw new Error("No se pudieron cargar los mensajes")
  }

  return data as MessageWithSender[]
}

/**
 * T047: Get messages grouped by student for a tutor
 * Returns conversations for all students who messaged about a specific session
 */
export async function getTutoringMessagesGroupedByStudent(params: {
  tutoring_session_id: string
  tutor_id: string
}): Promise<ConversationGroup[]> {
  const { tutoring_session_id, tutor_id } = params

  // Get session info
  const { data: session, error: sessionError } = await supabase
    .from('tutoring_sessions')
    .select('title')
    .eq('id', tutoring_session_id)
    .single()

  if (sessionError) {
    throw new Error("Sesión no encontrada")
  }

  // Get all messages for this session where tutor is involved
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      recipient:users!messages_recipient_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('tutoring_session_id', tutoring_session_id)
    .or(`sender_id.eq.${tutor_id},recipient_id.eq.${tutor_id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching grouped messages:', error)
    throw new Error("No se pudieron cargar las conversaciones")
  }

  // Group by student (the other participant)
  const conversationsMap = new Map<string, {
    participant: { id: string; full_name: string | null; avatar_url: string | null }
    messages: any[]
    unreadCount: number
  }>()

  for (const msg of messages || []) {
    const isFromTutor = msg.sender_id === tutor_id
    const studentId = isFromTutor ? msg.recipient_id : msg.sender_id
    const studentInfo = isFromTutor ? msg.recipient : msg.sender

    if (!conversationsMap.has(studentId)) {
      conversationsMap.set(studentId, {
        participant: studentInfo as { id: string; full_name: string | null; avatar_url: string | null },
        messages: [],
        unreadCount: 0,
      })
    }

    const conv = conversationsMap.get(studentId)!
    conv.messages.push(msg)

    // Count unread messages sent TO the tutor
    if (!isFromTutor && !msg.is_read) {
      conv.unreadCount++
    }
  }

  // Convert to array with last message
  const result: ConversationGroup[] = []
  for (const [studentId, conv] of conversationsMap) {
    result.push({
      participant: conv.participant,
      lastMessage: conv.messages[0] as MessageWithSender, // Already sorted desc
      unreadCount: conv.unreadCount,
      sessionId: tutoring_session_id,
      sessionTitle: session.title,
    })
  }

  // Sort by last message date (most recent first)
  result.sort((a, b) =>
    new Date(b.lastMessage.created_at || 0).getTime() -
    new Date(a.lastMessage.created_at || 0).getTime()
  )

  return result
}

/**
 * Get all conversations for a user (across all tutoring sessions)
 */
export async function getAllUserConversations(user_id: string): Promise<ConversationGroup[]> {
  // Get all messages where user is involved (exclude marketplace messages)
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      recipient:users!messages_recipient_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      session:tutoring_sessions(
        id,
        title
      )
    `)
    .is('product_id', null)
    .or(`sender_id.eq.${user_id},recipient_id.eq.${user_id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user conversations:', error)
    throw new Error("No se pudieron cargar las conversaciones")
  }

  // Group by session + other participant (unique conversation per session per user)
  const conversationsMap = new Map<string, {
    participant: { id: string; full_name: string | null; avatar_url: string | null }
    lastMessage: any
    unreadCount: number
    sessionId: string
    sessionTitle: string
  }>()

  for (const msg of messages || []) {
    const isFromUser = msg.sender_id === user_id
    const otherId = isFromUser ? msg.recipient_id : msg.sender_id
    const otherInfo = isFromUser ? msg.recipient : msg.sender
    const sessionInfo = msg.session as { id: string; title: string } | null

    const sessionId = sessionInfo?.id || 'direct'
    const key = `${sessionId}-${otherId}`

    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, {
        participant: otherInfo as { id: string; full_name: string | null; avatar_url: string | null },
        lastMessage: msg,
        unreadCount: 0,
        sessionId: sessionInfo?.id || '',
        sessionTitle: sessionInfo?.title || 'Mensaje directo',
      })
    }

    // Count unread messages sent TO the user
    if (!isFromUser && !msg.is_read) {
      const conv = conversationsMap.get(key)!
      conv.unreadCount++
    }
  }

  const result = Array.from(conversationsMap.values()) as ConversationGroup[]

  // Sort by last message date
  result.sort((a, b) =>
    new Date(b.lastMessage.created_at || 0).getTime() -
    new Date(a.lastMessage.created_at || 0).getTime()
  )

  return result
}

/**
 * T048: Mark messages as read
 */
export async function markMessagesAsRead(params: {
  tutoring_session_id?: string
  recipient_id: string
  sender_id: string
}): Promise<void> {
  const { tutoring_session_id, recipient_id, sender_id } = params

  let query = supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('sender_id', sender_id)
    .eq('recipient_id', recipient_id)
    .eq('is_read', false)
    .is('product_id', null)

  // Solo filtrar por sesión si se proporciona
  if (tutoring_session_id) {
    query = query.eq('tutoring_session_id', tutoring_session_id)
  }

  const { error } = await query

  if (error) {
    console.error('Error marking messages as read:', error)
    throw new Error("No se pudieron marcar los mensajes como leídos")
  }
}

/**
 * T049: Get unread message count for a user
 */
export async function getUnreadMessageCount(user_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user_id)
    .eq('is_read', false)
    .is('product_id', null)

  if (error) {
    console.error('Error counting unread messages:', error)
    return 0
  }

  return count || 0
}

/**
 * Get unread message count for a specific session
 */
export async function getUnreadMessageCountForSession(params: {
  tutoring_session_id: string
  user_id: string
}): Promise<number> {
  const { tutoring_session_id, user_id } = params

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('tutoring_session_id', tutoring_session_id)
    .eq('recipient_id', user_id)
    .eq('is_read', false)

  if (error) {
    console.error('Error counting unread messages for session:', error)
    return 0
  }

  return count || 0
}
