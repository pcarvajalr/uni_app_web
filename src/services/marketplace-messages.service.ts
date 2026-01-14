/**
 * Marketplace Messages Service
 * Handles all messaging functionality for marketplace products
 */

import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database.types"

type Message = Database['public']['Tables']['messages']['Row']

// Extended types with user info
export interface MarketplaceMessageWithSender extends Message {
  sender: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export interface MarketplaceConversationGroup {
  participant: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  product: {
    id: string
    title: string
    images: string[] | null
    price: number
  }
  lastMessage: MarketplaceMessageWithSender
  unreadCount: number
}

/**
 * Send a message for a marketplace product
 */
export async function sendMarketplaceMessage(params: {
  product_id: string
  sender_id: string
  recipient_id: string
  content: string
  images?: string[]
}): Promise<Message> {
  const { product_id, sender_id, recipient_id, content, images } = params

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
      product_id,
      sender_id,
      recipient_id,
      content: content.trim(),
      images: images || null,
      is_read: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending marketplace message:', error)
    throw new Error("No se pudo enviar el mensaje")
  }

  return data
}

/**
 * Get messages for a conversation about a product (between two users)
 */
export async function getMarketplaceMessages(params: {
  product_id: string
  user_id: string
  other_user_id: string
  limit?: number
  offset?: number
}): Promise<MarketplaceMessageWithSender[]> {
  const { product_id, user_id, other_user_id, limit = 50, offset = 0 } = params

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('product_id', product_id)
    .or(`and(sender_id.eq.${user_id},recipient_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},recipient_id.eq.${user_id})`)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching marketplace messages:', error)
    throw new Error("No se pudieron cargar los mensajes")
  }

  return data as MarketplaceMessageWithSender[]
}

/**
 * Get all marketplace conversations for a user
 */
export async function getMarketplaceConversations(user_id: string): Promise<MarketplaceConversationGroup[]> {
  // Get all messages where user is involved and have a product_id
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
      product:products(
        id,
        title,
        images,
        price
      )
    `)
    .not('product_id', 'is', null)
    .or(`sender_id.eq.${user_id},recipient_id.eq.${user_id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching marketplace conversations:', error)
    throw new Error("No se pudieron cargar las conversaciones")
  }

  // Group by product + other participant
  const conversationsMap = new Map<string, {
    participant: { id: string; full_name: string | null; avatar_url: string | null }
    product: { id: string; title: string; images: string[] | null; price: number }
    lastMessage: MarketplaceMessageWithSender
    unreadCount: number
  }>()

  for (const msg of messages || []) {
    const isFromUser = msg.sender_id === user_id
    const otherId = isFromUser ? msg.recipient_id : msg.sender_id
    const otherInfo = isFromUser ? msg.recipient : msg.sender
    const productInfo = msg.product as { id: string; title: string; images: string[] | null; price: number } | null

    if (!productInfo) continue

    const key = `${productInfo.id}-${otherId}`

    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, {
        participant: otherInfo as { id: string; full_name: string | null; avatar_url: string | null },
        product: productInfo,
        lastMessage: msg,
        unreadCount: 0,
      })
    }

    // Count unread messages sent TO the user
    if (!isFromUser && !msg.is_read) {
      const conv = conversationsMap.get(key)!
      conv.unreadCount++
    }
  }

  const result = Array.from(conversationsMap.values()) as MarketplaceConversationGroup[]

  // Sort by last message date
  result.sort((a, b) =>
    new Date(b.lastMessage.created_at || 0).getTime() -
    new Date(a.lastMessage.created_at || 0).getTime()
  )

  return result
}

/**
 * Mark marketplace messages as read
 */
export async function markMarketplaceMessagesAsRead(params: {
  product_id: string
  recipient_id: string
  sender_id: string
}): Promise<void> {
  const { product_id, recipient_id, sender_id } = params

  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('product_id', product_id)
    .eq('sender_id', sender_id)
    .eq('recipient_id', recipient_id)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking marketplace messages as read:', error)
    throw new Error("No se pudieron marcar los mensajes como leídos")
  }
}

/**
 * Get unread marketplace message count for a user
 */
export async function getUnreadMarketplaceCount(user_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user_id)
    .eq('is_read', false)
    .not('product_id', 'is', null)

  if (error) {
    console.error('Error counting unread marketplace messages:', error)
    return 0
  }

  return count || 0
}
