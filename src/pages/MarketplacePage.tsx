import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Heart, Star, X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { CreateProductDialog } from "@/components/marketplace/create-product-dialog"
import { ProductDetailsDialog } from "@/components/marketplace/product-details-dialog"
import { getProducts, getProductCategories, type ProductWithSeller } from "@/services/products.service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { useFavorites } from "@/contexts/favorites-context"
import { ProductFavoriteButton } from "@/components/marketplace/product-favorite-button"
import { Switch } from "@/components/ui/switch"
import type { Database } from "@/types/database.types"

type Product = ProductWithSeller
type Category = Database['public']['Tables']['categories']['Row']

export default function MarketplacePage() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const { isUserFavorite, favoritesCount, setInitialCounts, getProductFavoritesCount } = useFavorites()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(5000000)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Estados para datos reales
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const conditions = [
    { value: "new", label: "Nuevo" },
    { value: "like_new", label: "Como Nuevo" },
    { value: "good", label: "Bueno" },
    { value: "fair", label: "Regular" },
    { value: "poor", label: "Malo" },
  ]

  // Cargar productos y categorías
  useEffect(() => {
    loadData()
  }, [])

  // Inicializar contadores de favoritos cuando se cargan productos
  useEffect(() => {
    if (products.length > 0) {
      setInitialCounts(products.map(p => ({
        id: p.id,
        favorites_count: p.favorites_count
      })))
    }
  }, [products, setInitialCounts])

  async function loadData() {
    setLoading(true)
    setError(null)

    try {
      // Cargar productos y categorías en paralelo
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getProductCategories(),
      ])

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading marketplace data:', err)
      setError('No se pudieron cargar los productos. Por favor, intenta de nuevo.')
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Callback cuando se crea un producto
  function handleProductCreated() {
    loadData()
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice
    const matchesCondition = !selectedCondition || product.condition === selectedCondition
    const matchesStatus = product.status === 'available' // Solo mostrar productos disponibles
    const matchesFavorites = !showFavoritesOnly || isUserFavorite(product.id)
    return matchesSearch && matchesCategory && matchesPrice && matchesCondition && matchesStatus && matchesFavorites
  })

  const getConditionColor = (condition: string | null) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800"
      case "like_new":
        return "bg-blue-100 text-blue-800"
      case "good":
        return "bg-yellow-100 text-yellow-800"
      case "fair":
        return "bg-orange-100 text-orange-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionLabel = (condition: string | null) => {
    const found = conditions.find(c => c.value === condition)
    return found ? found.label : condition || 'N/A'
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
            </div>

            {/* Categories */}
            <h3 className="font-medium mb-3 text-sm">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Category Filter */}
              <div className="space-y-2">
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas las Categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition Filter */}
              <div className="space-y-2">
                <Select
                  value={selectedCondition || "all"}
                  onValueChange={(value) => setSelectedCondition(value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas las Condiciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Condiciones</SelectItem>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Solo Favoritos</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showFavoritesOnly}
                    onCheckedChange={setShowFavoritesOnly}
                    disabled={!isAuthenticated}
                  />
                  <span className="text-xs text-muted-foreground">
                    {favoritesCount} productos
                  </span>
                </div>
              </div>
            </div>

            {/* Price Range - Segunda fila */}
            <div className="mt-3">
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
            {(selectedCategory || selectedCondition || minPrice > 0 || maxPrice < 5000000 || showFavoritesOnly) && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                  </Badge>
                )}
                {selectedCondition && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getConditionLabel(selectedCondition)}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition(null)} />
                  </Badge>
                )}
                {showFavoritesOnly && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Solo Favoritos
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setShowFavoritesOnly(false)} />
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
                    setShowFavoritesOnly(false)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-medium mb-2">Cargando productos...</h3>
              <p className="text-muted-foreground">Un momento por favor</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <X className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-500" />
                <h3 className="text-lg font-medium mb-2">Error al cargar productos</h3>
                <p className="mb-4">{error}</p>
                <Button onClick={loadData}>Reintentar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={(product.images && product.images[0]) || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium line-clamp-2 text-sm">{product.title}</h3>
                      <ProductFavoriteButton
                        productId={product.id}
                        initialFavoritesCount={product.favorites_count || 0}
                        variant="ghost"
                        size="sm"
                      />
                    </div>

                    <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>

                    <div className="flex items-center space-x-2">
                      <Badge className={getConditionColor(product.condition)} variant="secondary">
                        {getConditionLabel(product.condition)}
                      </Badge>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span>{product.seller.rating?.toFixed(1) || '0.0'}</span>
                        <span>•</span>
                        <span>{product.seller.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{getProductFavoritesCount(product.id, product.favorites_count || 0)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {product.location || 'Sin ubicación'} •{' '}
                      {product.created_at ? new Date(product.created_at).toLocaleDateString('es-CO') : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
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
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{products.filter(p => p.status === 'available').length}</div>
                <p className="text-sm text-muted-foreground">Productos Disponibles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'sold').length}</div>
                <p className="text-sm text-muted-foreground">Vendidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                <p className="text-sm text-muted-foreground">Categorías</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredProducts.length}</div>
                <p className="text-sm text-muted-foreground">Resultados Filtrados</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <CreateProductDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProductCreated={handleProductCreated}
      />

      <ProductDetailsDialog
        product={selectedProduct as any}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </AppLayout>
  )
}
