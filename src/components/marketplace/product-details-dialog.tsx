"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Heart, MessageCircle, Star, Share, Flag } from "lucide-react"
import { useState } from "react"
import { ProductFavoriteButton } from "@/components/marketplace/product-favorite-button"
import { ProductOwnerActions } from "@/components/marketplace/product-owner-actions"
import { EditProductDialog } from "@/components/marketplace/edit-product-dialog"
import { useFavorites } from "@/contexts/favorites-context"
import { type ProductWithSeller } from "@/services/products.service"

interface ProductDetailsDialogProps {
  product: ProductWithSeller | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated?: () => void
}

export function ProductDetailsDialog({ product, open, onOpenChange, onProductUpdated }: ProductDetailsDialogProps) {
  const { getProductFavoritesCount } = useFavorites()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  if (!product) return null

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
    const conditions: Record<string, string> = {
      new: "Nuevo",
      like_new: "Como Nuevo",
      good: "Bueno",
      fair: "Regular",
      poor: "Malo",
    }
    return conditions[condition || ""] || condition || "N/A"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const sellerInitials = product.seller.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden w-full max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-left">{product.title}</DialogTitle>
          <DialogDescription className="text-left">Publicado el {formatDate(product.created_at)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="space-y-2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={(product.images && product.images[currentImageIndex]) || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      index === currentImageIndex ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
            <div className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end items-center">
              {/* Contador informativo separado */}
              <div className="flex items-center text-sm text-muted-foreground mr-2">
                <Heart className="h-4 w-4 mr-1" />
                <span>{getProductFavoritesCount(product.id, product.favorites_count || 0)}</span>
              </div>
              {/* Botón para marcar/desmarcar - sin contador */}
              <ProductFavoriteButton
                productId={product.id}
                initialFavoritesCount={product.favorites_count || 0}
                variant="outline"
                size="default"
                showCount={false}
              />
              <Button variant="outline" size="default">
                <Share className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
              <ProductOwnerActions
                product={product}
                onUpdate={() => {
                  onProductUpdated?.()
                  onOpenChange(false)
                }}
                onEdit={() => {
                  setIsEditDialogOpen(true)
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge className={getConditionColor(product.condition)}>{getConditionLabel(product.condition)}</Badge>
              {product.category && <Badge variant="outline">{product.category.name}</Badge>}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Descripción</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {product.location}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(product.created_at)}
              </span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-medium">Vendedor</h3>
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">{sellerInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
                  <span className="font-medium">{product.seller.full_name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm">{product.seller.rating || "Nuevo"}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">{product.seller_id}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                Ver Perfil
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Contactar Vendedor</span>
              <span className="sm:hidden">Contactar</span>
            </Button>
            <Button variant="outline" size="icon">
              <Flag className="h-4 w-4" />
            </Button>
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Consejos de Seguridad</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Reúnete en lugares públicos del campus</li>
              <li>• Inspecciona el producto antes de pagar</li>
              <li>• Usa métodos de pago seguros</li>
              <li>• Reporta cualquier comportamiento sospechoso</li>
            </ul>
          </div>
        </div>
      </DialogContent>

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={product}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProductUpdated={() => {
          onProductUpdated?.()
          setIsEditDialogOpen(false)
        }}
      />
    </Dialog>
  )
}
