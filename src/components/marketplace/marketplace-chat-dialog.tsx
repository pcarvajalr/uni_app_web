"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Send, Loader2, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  useMarketplaceMessages,
  useSendMarketplaceMessage,
  useMarkMarketplaceMessagesAsRead,
} from "@/hooks/useMarketplaceMessages"
import type { ProductWithSeller } from "@/services/products.service"
import type { MarketplaceMessageWithSender } from "@/services/marketplace-messages.service"

interface MarketplaceChatDialogProps {
  product: ProductWithSeller | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MarketplaceChatDialog({ product, open, onOpenChange }: MarketplaceChatDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUserId = user?.id || ""
  const sellerId = product?.seller_id || ""
  const canChat = !!currentUserId && !!sellerId && currentUserId !== sellerId

  const {
    data: messages,
    isLoading,
    error,
  } = useMarketplaceMessages({
    product_id: product?.id || "",
    user_id: currentUserId,
    other_user_id: sellerId,
    enabled: canChat && open,
    refetchInterval: 5000, // Poll every 5 seconds
  })

  const sendMessage = useSendMarketplaceMessage()
  const markAsRead = useMarkMarketplaceMessagesAsRead()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages && messages.length > 0 && currentUserId && sellerId && product) {
      const hasUnread = messages.some(
        (msg) => msg.recipient_id === currentUserId && !msg.is_read
      )
      if (hasUnread) {
        markAsRead.mutate({
          product_id: product.id,
          recipient_id: currentUserId,
          sender_id: sellerId,
        })
      }
    }
  }, [messages, product, currentUserId, sellerId, markAsRead])

  const handleSend = async () => {
    if (!message.trim() || !currentUserId || !sellerId || !product) return

    try {
      await sendMessage.mutateAsync({
        product_id: product.id,
        sender_id: currentUserId,
        recipient_id: sellerId,
        content: message.trim(),
      })
      setMessage("")
      inputRef.current?.focus()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Contactar Vendedor</DialogTitle>
          <DialogDescription>
            Enviar mensaje sobre este producto
          </DialogDescription>
        </DialogHeader>

        {/* Product Mini Card */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg flex-shrink-0">
          <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
            <img
              src={(product.images && product.images[0]) || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{product.title}</p>
            <p className="text-sm text-primary font-semibold">{formatPrice(product.price)}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 py-2 flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={product.seller.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(product.seller.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{product.seller.full_name}</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          {!canChat ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {!currentUserId
                  ? "Inicia sesion para enviar mensajes"
                  : "No puedes enviarte mensajes a ti mismo"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-end" : "")}>
                  {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                  <Skeleton className="h-16 w-48 rounded-lg" />
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-destructive">Error al cargar los mensajes</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              {messages && messages.length > 0 ? (
                <div className="space-y-4 py-4">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.sender_id === currentUserId}
                      sellerName={product.seller.full_name}
                      sellerAvatar={product.seller.avatar_url}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Inicia una conversacion con el vendedor
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        {canChat && (
          <div className="flex gap-2 pt-4 border-t flex-shrink-0">
            <Input
              ref={inputRef}
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface MessageBubbleProps {
  message: MarketplaceMessageWithSender
  isOwn: boolean
  sellerName: string
  sellerAvatar?: string | null
}

function MessageBubble({ message, isOwn, sellerName, sellerAvatar }: MessageBubbleProps) {
  const senderName = isOwn ? "Tu" : (message.sender?.full_name || sellerName)
  const senderAvatar = isOwn ? null : (message.sender?.avatar_url || sellerAvatar)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={senderAvatar || undefined} />
        <AvatarFallback className="text-xs">
          {getInitials(senderName)}
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
