"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Clock, Heart, MessageCircle, Star, Share, Flag } from "lucide-react"
import { useState } from "react"

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

interface ProductDetailsDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailsDialog({ product, open, onOpenChange }: ProductDetailsDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  if (!product) return null

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

  const sellerInitials = product.seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{product.title}</DialogTitle>
          <DialogDescription className="text-left">Publicado el {product.datePosted}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="space-y-2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
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
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                {product.likes + (isLiked ? 1 : 0)}
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-1" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge className={getConditionColor(product.condition)}>{product.condition}</Badge>
              <Badge variant="outline">{product.category}</Badge>
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
                {product.datePosted}
              </span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-medium">Vendedor</h3>
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">{sellerInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{product.seller.name}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm">{product.seller.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">ID: {product.seller.studentId}</p>
              </div>
              <Button variant="outline" size="sm">
                Ver Perfil
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contactar Vendedor
            </Button>
            <Button variant="outline">
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
    </Dialog>
  )
}
