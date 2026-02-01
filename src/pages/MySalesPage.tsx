import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, MessageSquare, Eye, Trash2, Edit2, Loader2, Heart, Package } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { getProducts, getProductById, updateProduct, deleteProduct, type ProductWithSeller } from "@/services/products.service"
import { getMarketplaceConversations, type MarketplaceConversationGroup } from "@/services/marketplace-messages.service"
import { MarketplaceChatDialog } from "@/components/marketplace/marketplace-chat-dialog"

export default function MySalesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState("productos")
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [conversations, setConversations] = useState<MarketplaceConversationGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: "", price: 0, description: "" })
  const [savingEdit, setSavingEdit] = useState(false)
  const [chatProduct, setChatProduct] = useState<ProductWithSeller | null>(null)
  const [chatParticipant, setChatParticipant] = useState<{ id: string; name: string; avatar: string | null } | null>(null)
  const [showChatDialog, setShowChatDialog] = useState(false)

  const loadProducts = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const data = await getProducts({ seller_id: user.id })
      setProducts(data as ProductWithSeller[])
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar tus productos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [user?.id, toast])

  const loadConversations = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoadingConversations(true)
      const data = await getMarketplaceConversations(user.id)
      setConversations(data)
    } catch {
      console.error("Error loading conversations")
    } finally {
      setLoadingConversations(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadProducts()
    loadConversations()
  }, [loadProducts, loadConversations])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "available": return "Activo"
      case "sold": return "Vendido"
      case "reserved": return "Reservado"
      default: return status || "Desconocido"
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800"
      case "sold": return "bg-blue-100 text-blue-800"
      case "reserved": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionLabel = (condition: string | null) => {
    switch (condition) {
      case "new": return "Nuevo"
      case "like_new": return "Como Nuevo"
      case "good": return "Bueno"
      case "fair": return "Aceptable"
      case "poor": return "Usado"
      default: return condition || ""
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Producto eliminado", description: "El producto ha sido eliminado correctamente" })
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditOpen = (product: ProductWithSeller) => {
    setSelectedProduct(product)
    setEditForm({
      title: product.title,
      price: product.price,
      description: product.description || "",
    })
    setShowEditDialog(true)
  }

  const handleEditSave = async () => {
    if (!selectedProduct) return
    try {
      setSavingEdit(true)
      await updateProduct(selectedProduct.id, {
        title: editForm.title,
        price: editForm.price,
        description: editForm.description,
      })
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, title: editForm.title, price: editForm.price, description: editForm.description }
            : p
        )
      )
      setShowEditDialog(false)
      toast({ title: "Producto actualizado", description: "Los cambios han sido guardados" })
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el producto", variant: "destructive" })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleOpenChat = async (conv: MarketplaceConversationGroup) => {
    const existingProduct = products.find((p) => p.id === conv.product.id)
    if (existingProduct) {
      setChatProduct(existingProduct)
    } else {
      try {
        const fullProduct = await getProductById(conv.product.id)
        setChatProduct(fullProduct as ProductWithSeller)
      } catch {
        toast({ title: "Error", description: "No se pudo cargar el producto", variant: "destructive" })
        return
      }
    }
    setChatParticipant({
      id: conv.participant.id,
      name: conv.participant.full_name || "Usuario",
      avatar: conv.participant.avatar_url,
    })
    setShowChatDialog(true)
  }

  const activeProducts = products.filter((p) => p.status === "available" || p.status === "reserved")
  const soldProducts = products.filter((p) => p.status === "sold")
  const totalViews = products.reduce((sum, p) => sum + (p.views ?? 0), 0)
  const totalFavorites = products.reduce((sum, p) => sum + (p.favorites_count ?? 0), 0)
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi Panel de Ventas</h1>
          <p className="text-muted-foreground">Gestiona tus productos y ofertas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{soldProducts.length}</div>
              <p className="text-sm text-muted-foreground">Vendidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{activeProducts.length}</div>
              <p className="text-sm text-muted-foreground">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
              <p className="text-sm text-muted-foreground">Vistas Totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalFavorites}</div>
              <p className="text-sm text-muted-foreground">Favoritos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
            <TabsTrigger value="productos">Mis Productos ({products.length})</TabsTrigger>
            <TabsTrigger value="mensajes">Mensajes {unreadMessages > 0 ? `(${unreadMessages})` : ""}</TabsTrigger>
            <TabsTrigger value="ventas">Historial</TabsTrigger>
          </TabsList>

          {/* My Products Tab */}
          <TabsContent value="productos" className="space-y-4">
            {activeProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No tienes productos activos</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{product.title}</h3>
                            <Badge className={`${getStatusColor(product.status)} flex-shrink-0`}>
                              {getStatusLabel(product.status)}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
                          {product.condition && (
                            <p className="text-xs text-muted-foreground">{getConditionLabel(product.condition)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-3">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {product.views ?? 0} vistas
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {product.favorites_count ?? 0} favoritos
                        </span>
                        <span>
                          {product.created_at
                            ? new Date(product.created_at).toLocaleDateString("es-CO")
                            : ""}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditOpen(product)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          disabled={deletingId === product.id}
                          onClick={() => handleDelete(product.id)}
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="mensajes" className="space-y-4">
            {loadingConversations ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No tienes conversaciones</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <Card
                    key={`${conv.product.id}-${conv.participant.id}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleOpenChat(conv)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{conv.participant.full_name || "Usuario"}</h3>
                          <p className="text-sm text-muted-foreground mb-1 truncate">{conv.product.title}</p>
                          <p className="text-sm truncate">{conv.lastMessage.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-3">
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground">{conv.unreadCount}</Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {conv.lastMessage.created_at
                              ? new Date(conv.lastMessage.created_at).toLocaleDateString("es-CO")
                              : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sales History Tab */}
          <TabsContent value="ventas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                {soldProducts.length === 0 ? (
                  <div className="text-center py-6">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aún no tienes ventas completadas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {soldProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium truncate">{product.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Vendido el{" "}
                            {product.updated_at
                              ? new Date(product.updated_at).toLocaleDateString("es-CO")
                              : ""}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-lg font-bold text-green-600">{formatPrice(product.price)}</p>
                          <Badge variant="outline">Completada</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Chat Dialog */}
        <MarketplaceChatDialog
          product={chatProduct}
          open={showChatDialog}
          onOpenChange={setShowChatDialog}
          participantId={chatParticipant?.id}
          participantName={chatParticipant?.name}
          participantAvatar={chatParticipant?.avatar}
        />

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Precio</label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe tu producto..."
                />
              </div>
              <Button className="w-full" onClick={handleEditSave} disabled={savingEdit}>
                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
