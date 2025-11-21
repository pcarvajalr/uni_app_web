import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Heart, Star, X } from "lucide-react"
import { useState } from "react"
import { CreateProductDialog } from "@/components/marketplace/create-product-dialog"
import { ProductDetailsDialog } from "@/components/marketplace/product-details-dialog"

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: "nuevo" | "como-nuevo" | "usado" | "para-reparar"
  images: string[]
  seller: {
    name: string
    rating: number
    studentId: string
  }
  location: string
  datePosted: string
  likes: number
  isLiked: boolean
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(5000000)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)

  const categories = [
    { id: "todos", name: "Todos", count: 48 },
    { id: "libros", name: "Libros", count: 15 },
    { id: "electronica", name: "Electrónicos", count: 12 },
    { id: "ropa", name: "Ropa", count: 8 },
    { id: "muebles", name: "Muebles", count: 6 },
    { id: "deportes", name: "Deportes", count: 4 },
    { id: "otros", name: "Otros", count: 3 },
  ]

  const conditions = [
    { id: "todos", name: "Todas las Condiciones" },
    { id: "nuevo", name: "Nuevo" },
    { id: "como-nuevo", name: "Como Nuevo" },
    { id: "usado", name: "Usado" },
    { id: "para-reparar", name: "Para Reparar" },
  ]

  const mockProducts: Product[] = [
    {
      id: "1",
      title: "Cálculo Diferencial - Stewart",
      description:
        "Libro de cálculo en excelente estado, con todas las páginas y sin rayones. Perfecto para estudiantes de ingeniería.",
      price: 45000,
      category: "libros",
      condition: "como-nuevo",
      images: ["/placeholder.svg?height=200&width=200&text=Libro+Calculo"],
      seller: {
        name: "Ana García",
        rating: 4.8,
        studentId: "2023001",
      },
      location: "Campus Norte",
      datePosted: "2024-01-14",
      likes: 12,
      isLiked: false,
    },
    {
      id: "2",
      title: "MacBook Air M1 2020",
      description:
        "MacBook Air en excelente estado, usado solo para estudios. Incluye cargador original y funda protectora.",
      price: 2800000,
      category: "electronica",
      condition: "usado",
      images: ["/placeholder.svg?height=200&width=200&text=MacBook+Air"],
      seller: {
        name: "Carlos Ruiz",
        rating: 4.9,
        studentId: "2022045",
      },
      location: "Campus Sur",
      datePosted: "2024-01-13",
      likes: 28,
      isLiked: true,
    },
    {
      id: "3",
      title: "Escritorio de Estudio",
      description:
        "Escritorio de madera en buen estado, ideal para estudiar. Incluye cajones y espacio para computador.",
      price: 150000,
      category: "muebles",
      condition: "usado",
      images: ["/placeholder.svg?height=200&width=200&text=Escritorio"],
      seller: {
        name: "María López",
        rating: 4.6,
        studentId: "2023078",
      },
      location: "Residencias",
      datePosted: "2024-01-12",
      likes: 8,
      isLiked: false,
    },
    {
      id: "4",
      title: "Calculadora Científica Casio",
      description: "Calculadora científica programable, perfecta para ingeniería y matemáticas avanzadas.",
      price: 85000,
      category: "electronica",
      condition: "como-nuevo",
      images: ["/placeholder.svg?height=200&width=200&text=Calculadora"],
      seller: {
        name: "Diego Morales",
        rating: 4.7,
        studentId: "2023156",
      },
      location: "Campus Central",
      datePosted: "2024-01-11",
      likes: 5,
      isLiked: false,
    },
  ]

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice
    const matchesCondition = !selectedCondition || product.condition === selectedCondition
    return matchesSearch && matchesCategory && matchesPrice && matchesCondition
  })

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "nuevo":
        return "bg-green-100 text-green-800"
      case "como-nuevo":
        return "bg-blue-100 text-blue-800"
      case "usado":
        return "bg-yellow-100 text-yellow-800"
      case "para-reparar":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Marketplace Estudiantil</h1>
            <p className="text-muted-foreground">Compra y vende con otros estudiantes</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Vender
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Categories */}
            <h3 className="font-medium mb-3 text-sm">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Categoría</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Todas las Categorías</option>
                  <option value="libros">Libros</option>
                  <option value="electronica">Electrónicos</option>
                  <option value="ropa">Ropa</option>
                  <option value="muebles">Muebles</option>
                  <option value="deportes">Deportes</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              {/* Condition Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Estado del Producto</label>
                <select
                  value={selectedCondition || ""}
                  onChange={(e) => setSelectedCondition(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Todas las Condiciones</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="como-nuevo">Como Nuevo</option>
                  <option value="usado">Usado</option>
                  <option value="para-reparar">Para Reparar</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Rango de Precio</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full text-sm"
                  />
                  <span className="text-muted-foreground text-sm">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory || selectedCondition || minPrice > 0 || maxPrice < 5000000) && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                  </Badge>
                )}
                {selectedCondition && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedCondition}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition(null)} />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedCondition(null)
                    setMinPrice(0)
                    setMaxPrice(5000000)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium line-clamp-2 text-sm">{product.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-1 ${product.isLiked ? "text-red-500" : "text-gray-400"}`}
                    >
                      <Heart className={`h-4 w-4 ${product.isLiked ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>

                  <div className="flex items-center space-x-2">
                    <Badge className={getConditionColor(product.condition)} variant="secondary">
                      {product.condition}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span>{product.seller.rating}</span>
                      <span>•</span>
                      <span>{product.seller.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{product.likes}</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {product.location} • {product.datePosted}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                <p>Intenta cambiar los filtros de búsqueda o explora otras categorías</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">48</div>
              <p className="text-sm text-muted-foreground">Productos Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <p className="text-sm text-muted-foreground">Vendidos Hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <p className="text-sm text-muted-foreground">Usuarios Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <p className="text-sm text-muted-foreground">Rating Promedio</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateProductDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <ProductDetailsDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </AppLayout>
  )
}
