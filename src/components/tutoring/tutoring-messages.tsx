"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Send, Loader2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  useTutoringMessages,
  useSendTutoringMessage,
  useMarkMessagesAsRead,
} from "@/hooks/useTutoringMessages"
import type { MessageWithSender } from "@/services/tutoring-messages.service"

interface TutoringMessagesProps {
  sessionId?: string
  tutorId: string
  tutorName: string
  tutorAvatar?: string | null
  studentId?: string
  className?: string
}

export function TutoringMessages({
  sessionId,
  tutorId,
  tutorName,
  tutorAvatar,
  studentId,
  className,
}: TutoringMessagesProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUserId = user?.id || ""
  // Para conversaciones directas (sin sesión específica), usar studentId si está disponible
  const otherUserId = studentId || (currentUserId === tutorId ? "" : tutorId)
  const isTutor = currentUserId === tutorId

  // Permitir chat si hay currentUserId y otherUserId, incluso si el usuario es el tutor
  // (cuando se proporciona studentId, el tutor puede chatear)
  const canChat = !!currentUserId && !!otherUserId && currentUserId !== otherUserId

  const {
    data: messages,
    isLoading,
    error,
  } = useTutoringMessages({
    tutoring_session_id: sessionId,
    user_id: currentUserId,
    other_user_id: otherUserId,
    enabled: canChat,
    refetchInterval: 5000, // Poll every 5 seconds for active conversations
  })

  const sendMessage = useSendTutoringMessage()
  const markAsRead = useMarkMessagesAsRead()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages && messages.length > 0 && currentUserId && otherUserId) {
      const hasUnread = messages.some(
        (msg) => msg.recipient_id === currentUserId && !msg.is_read
      )
      if (hasUnread) {
        markAsRead.mutate({
          tutoring_session_id: sessionId,
          recipient_id: currentUserId,
          sender_id: otherUserId,
        })
      }
    }
  }, [messages, sessionId, currentUserId, otherUserId])

  const handleSend = async () => {
    // Validar que tenemos sessionId para enviar mensajes
    if (!message.trim() || !currentUserId || !otherUserId || !sessionId) return

    try {
      await sendMessage.mutateAsync({
        tutoring_session_id: sessionId,
        sender_id: currentUserId,
        recipient_id: otherUserId,
        content: message.trim(),
      })
      setMessage("")
      inputRef.current?.focus()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // If user is the tutor without a specific student to chat with, show a different message
  if (isTutor && !studentId) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Los mensajes de los estudiantes aparecerán en "Mis Sesiones"
        </p>
      </div>
    )
  }

  // If user is not authenticated
  if (!currentUserId) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Inicia sesión para enviar mensajes al tutor
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-end" : "")}>
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <Skeleton className="h-16 w-48 rounded-lg" />
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <p className="text-destructive">Error al cargar los mensajes</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 pr-4 max-h-[300px]">
        {messages && messages.length > 0 ? (
          <div className="space-y-4 py-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
                tutorName={tutorName}
                tutorAvatar={tutorAvatar}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Inicia una conversación con el tutor
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <div className="flex gap-2 pt-4 border-t mt-4">
        <Input
          ref={inputRef}
          placeholder={sessionId ? "Escribe tu mensaje..." : "Necesitas una sesión activa para enviar mensajes"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sendMessage.isPending || !sessionId}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending || !sessionId}
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  tutorName: string
  tutorAvatar?: string | null
}

function MessageBubble({ message, isOwn, tutorName, tutorAvatar }: MessageBubbleProps) {
  const senderName = isOwn ? "Tú" : (message.sender?.full_name || tutorName)
  const senderAvatar = isOwn ? null : (message.sender?.avatar_url || tutorAvatar)

  return (
    <div className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={senderAvatar || undefined} />
        <AvatarFallback className="text-xs">
          {senderName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {message.created_at
            ? format(new Date(message.created_at), "HH:mm", { locale: es })
            : ""}
        </span>
      </div>
    </div>
  )
}

// Export a simpler component for conversation list in MySessionsPage
export interface ConversationItemProps {
  participant: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  lastMessage: string
  lastMessageDate: string | null
  unreadCount: number
  onClick: () => void
}

export function ConversationItem({
  participant,
  lastMessage,
  lastMessageDate,
  unreadCount,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={participant.avatar_url || undefined} />
          <AvatarFallback>
            {(participant.full_name || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">
            {participant.full_name || "Usuario"}
          </span>
          {lastMessageDate && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(lastMessageDate), "dd/MM HH:mm", { locale: es })}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>
    </button>
  )
}
