import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Mail } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useMarketplaceConversations } from "@/hooks/useMarketplaceMessages"
import { useUserConversations } from "@/hooks/useTutoringMessages"
import { useContactMessages } from "@/hooks/useContactMessages"
import { ConversationItem, TutoringMessages } from "@/components/tutoring/tutoring-messages"
import { MarketplaceChatDialog } from "@/components/marketplace/marketplace-chat-dialog"
import { ContactMessageDialog } from "@/components/chats/contact-message-dialog"
import { getProductById, type ProductWithSeller } from "@/services/products.service"
import type { MarketplaceConversationGroup } from "@/services/marketplace-messages.service"
import type { ContactMessage } from "@/services/contact-messages.service"

export default function ChatsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const userId = user?.id || ""
  const isAdmin = user?.role === "admin"
  const [selectedTab, setSelectedTab] = useState("tienda")

  // --- Tienda (marketplace) ---
  const { data: marketplaceConvs, isLoading: loadingMarketplace } =
    useMarketplaceConversations(userId, selectedTab === "tienda")
  const [chatProduct, setChatProduct] = useState<ProductWithSeller | null>(null)
  const [chatParticipant, setChatParticipant] = useState<{
    id: string
    name: string
    avatar: string | null
  } | null>(null)
  const [showMarketplaceDialog, setShowMarketplaceDialog] = useState(false)

  const handleOpenMarketplaceChat = async (conv: MarketplaceConversationGroup) => {
    try {
      const fullProduct = await getProductById(conv.product.id)
      setChatProduct(fullProduct as ProductWithSeller)
    } catch {
      toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" })
      return
    }
    setChatParticipant({
      id: conv.participant.id,
      name: conv.participant.full_name || "Usuario",
      avatar: conv.participant.avatar_url,
    })
    setShowMarketplaceDialog(true)
  }

  // --- Tutorías ---
  const { data: tutoringConvs, isLoading: loadingTutoring } =
    useUserConversations(userId, selectedTab === "tutorias")
  const [selectedTutoring, setSelectedTutoring] = useState<{
    id: string
    name: string
    avatar?: string | null
    sessionId: string
  } | null>(null)
  const [showTutoringDialog, setShowTutoringDialog] = useState(false)

  // --- Contacto (admin) ---
  const { data: contactMessages, isLoading: loadingContact } =
    useContactMessages(isAdmin && selectedTab === "contacto")
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
  const [showContactDialog, setShowContactDialog] = useState(false)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Chats</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Conversaciones de tienda y tutorías, y mensajes de contacto"
              : "Tus conversaciones de tienda y tutorías"}
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList
            className={cn(
              "grid w-full min-h-9 h-auto",
              isAdmin ? "grid-cols-3" : "grid-cols-2"
            )}
          >
            <TabsTrigger value="tienda">Tienda</TabsTrigger>
            <TabsTrigger value="tutorias">Tutorías</TabsTrigger>
            {isAdmin && <TabsTrigger value="contacto">Contacto</TabsTrigger>}
          </TabsList>

          {/* Tab Tienda */}
          <TabsContent value="tienda" className="space-y-3">
            {loadingMarketplace ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : marketplaceConvs && marketplaceConvs.length > 0 ? (
              marketplaceConvs.map((conv) => (
                <Card
                  key={`${conv.product.id}-${conv.participant.id}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleOpenMarketplaceChat(conv)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {conv.participant.full_name || "Usuario"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {conv.product.title}
                        </p>
                        <p className="text-sm truncate">{conv.lastMessage.content}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-3">
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-orange-500 text-white">{conv.unreadCount}</Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {conv.lastMessage.created_at
                            ? format(new Date(conv.lastMessage.created_at), "dd MMM", { locale: es })
                            : ""}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aún no tienes chats de tienda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Tutorías */}
          <TabsContent value="tutorias" className="space-y-2">
            {loadingTutoring ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : tutoringConvs && tutoringConvs.length > 0 ? (
              <Card>
                <CardContent className="p-2">
                  {tutoringConvs.map((conv) => (
                    <ConversationItem
                      key={`${conv.sessionId || "direct"}-${conv.participant.id}`}
                      participant={conv.participant}
                      lastMessage={conv.lastMessage.content || ""}
                      lastMessageDate={conv.lastMessage.created_at}
                      unreadCount={conv.unreadCount}
                      onClick={() => {
                        setSelectedTutoring({
                          id: conv.participant.id,
                          name: conv.participant.full_name || "Usuario",
                          avatar: conv.participant.avatar_url,
                          sessionId: conv.sessionId,
                        })
                        setShowTutoringDialog(true)
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aún no tienes chats de tutorías</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Contacto (admin) */}
          {isAdmin && (
            <TabsContent value="contacto" className="space-y-3">
              {loadingContact ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : contactMessages && contactMessages.length > 0 ? (
                contactMessages.map((msg) => (
                  <Card
                    key={msg.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedContact(msg)
                      setShowContactDialog(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full shrink-0",
                              msg.status === "new" ? "bg-orange-500" : "bg-transparent"
                            )}
                          />
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{msg.email}</h3>
                            <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {msg.created_at
                            ? format(new Date(msg.created_at), "dd MMM", { locale: es })
                            : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay mensajes de contacto</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Diálogo chat tienda */}
      <MarketplaceChatDialog
        product={chatProduct}
        open={showMarketplaceDialog}
        onOpenChange={setShowMarketplaceDialog}
        participantId={chatParticipant?.id}
        participantName={chatParticipant?.name}
        participantAvatar={chatParticipant?.avatar}
      />

      {/* Diálogo chat tutoría */}
      <Dialog open={showTutoringDialog} onOpenChange={setShowTutoringDialog}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Conversación con {selectedTutoring?.name}</DialogTitle>
            <DialogDescription>Historial completo de mensajes</DialogDescription>
          </DialogHeader>
          {selectedTutoring && user && (
            <TutoringMessages
              sessionId={selectedTutoring.sessionId || undefined}
              studentId={selectedTutoring.id}
              tutorId={user.id}
              tutorName={selectedTutoring.name}
              tutorAvatar={selectedTutoring.avatar}
              className="flex-1"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo detalle contacto */}
      <ContactMessageDialog
        message={selectedContact}
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
      />
    </AppLayout>
  )
}
