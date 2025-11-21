import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, MessageSquare, Eye, Trash2, Edit2, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

interface SaleProduct {
  id: string
  title: string
  price: number
  condition: string
  image: string
  status: "activo" | "vendido" | "pausado"
  datePosted: string
  views: number
  likes: number
  offers: number
  messages: number
}

interface Offer {
  id: string
  productId: string
  productTitle: string
  buyerName: string
  offerPrice: number
  date: string
  status: "pendiente" | "aceptada" | "rechazada"
  message: string
}

export default function MySalesPage() {
  const [selectedTab, setSelectedTab] = useState("productos")
  const [selectedProduct, setSelectedProduct] = useState<SaleProduct | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const myProducts: SaleProduct[] = [
    {
      id: "1",
      title: "MacBook Air M1 2020",
      price: 2800000,
      condition: "usado",
      image: "/placeholder.svg?height=200&width=200&text=MacBook",
      status: "activo",
      datePosted: "2024-01-13",
      views: 156,
      likes: 28,
      offers: 5,
      messages: 12,
    },
    {
      id: "2",
      title: "Escritorio de Estudio",
      price: 150000,
      condition: "usado",
      image: "/placeholder.svg?height=200&width=200&text=Escritorio",
      status: "vendido",
      datePosted: "2024-01-12",
      views: 89,
      likes: 8,
      offers: 2,
      messages: 3,
    },
    {
      id: "3",
      title: "Calculadora Científica Casio",
      price: 85000,
      condition: "como-nuevo",
      image: "/placeholder.svg?height=200&width=200&text=Calculadora",
      status: "activo",
      datePosted: "2024-01-11",
      views: 34,
      likes: 5,
      offers: 1,
      messages: 2,
    },
  ]

  const offers: Offer[] = [
    {
      id: "1",
      productId: "1",
      productTitle: "MacBook Air M1 2020",
      buyerName: "Ana García",
      offerPrice: 2600000,
      date: "2024-01-14",
      status: "pendiente",
      message: "Interesado en comprar. ¿Podrías considerar esta oferta?",
    },
    {
      id: "2",
      productId: "1",
      productTitle: "MacBook Air M1 2020",
      buyerName: "Carlos López",
      offerPrice: 2750000,
      date: "2024-01-13",
      status: "aceptada",
      message: "Acepto tu precio. ¿Cuándo puedo ir por el producto?",
    },
    {
      id: "3",
      productId: "3",
      productTitle: "Calculadora Científica Casio",
      buyerName: "Diego Morales",
      offerPrice: 80000,
      date: "2024-01-10",
      status: "rechazada",
      message: "¿Es posible negociar el precio?",
    },
  ]

  const messages = [
    { id: "1", sender: "Ana García", product: "MacBook Air M1", lastMessage: "¿Está disponible aún?", unread: true },
    { id: "2", sender: "Juan Pérez", product: "Escritorio", lastMessage: "Me interesa mucho", unread: false },
    { id: "3", sender: "María López", product: "Calculadora", lastMessage: "¿Dónde nos encontramos?", unread: true },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-100 text-green-800"
      case "vendido":
        return "bg-blue-100 text-blue-800"
      case "pausado":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "aceptada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalSales = myProducts.filter((p) => p.status === "vendido").length
  const totalViews = myProducts.reduce((sum, p) => sum + p.views, 0)
  const totalLikes = myProducts.reduce((sum, p) => sum + p.likes, 0)

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
              <div className="text-2xl font-bold text-green-600">{totalSales}</div>
              <p className="text-sm text-muted-foreground">Vendidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {myProducts.filter((p) => p.status === "activo").length}
              </div>
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
              <div className="text-2xl font-bold text-purple-600">{totalLikes}</div>
              <p className="text-sm text-muted-foreground">Me Gusta</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="productos">Mis Productos</TabsTrigger>
            <TabsTrigger value="ofertas">Ofertas ({offers.filter((o) => o.status === "pendiente").length})</TabsTrigger>
            <TabsTrigger value="mensajes">Mensajes ({messages.filter((m) => m.unread).length})</TabsTrigger>
            <TabsTrigger value="ventas">Historial</TabsTrigger>
          </TabsList>

          {/* My Products Tab */}
          <TabsContent value="productos" className="space-y-4">
            <div className="space-y-3">
              {myProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">{product.title}</h3>
                          <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                        </div>

                        <p className="text-lg font-bold text-primary mb-2">{formatPrice(product.price)}</p>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {product.views} vistas
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {product.likes} me gusta
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {product.messages} mensajes
                          </span>
                          <span>{product.datePosted}</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedProduct(product)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Producto</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Título</label>
                                <Input defaultValue={selectedProduct?.title} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Precio</label>
                                <Input type="number" defaultValue={selectedProduct?.price} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Descripción</label>
                                <Textarea placeholder="Describe tu producto..." />
                              </div>
                              <Button className="w-full">Guardar Cambios</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="ofertas" className="space-y-4">
            <div className="space-y-3">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{offer.productTitle}</h3>
                          <p className="text-sm text-muted-foreground">De: {offer.buyerName}</p>
                        </div>
                        <Badge className={getOfferStatusColor(offer.status)}>{offer.status}</Badge>
                      </div>

                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm italic">"{offer.message}"</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Oferta:</p>
                          <p className="text-xl font-bold text-primary">{formatPrice(offer.offerPrice)}</p>
                        </div>
                        <div className="flex space-x-2">
                          {offer.status === "pendiente" && (
                            <>
                              <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aceptar
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          {offer.status === "aceptada" && (
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contactar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="mensajes" className="space-y-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <Card key={msg.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{msg.sender}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{msg.product}</p>
                        <p className="text-sm truncate">{msg.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end space-x-2">
                        {msg.unread && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sales History Tab */}
          <TabsContent value="ventas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myProducts
                    .filter((p) => p.status === "vendido")
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{product.title}</h4>
                          <p className="text-sm text-muted-foreground">Vendido el {product.datePosted}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatPrice(product.price)}</p>
                          <Badge variant="outline">Completada</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
