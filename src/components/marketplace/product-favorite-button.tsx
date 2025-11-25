"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { toggleProductFavorite } from "@/services/products.service"

interface ProductFavoriteButtonProps {
  productId: string
  initialIsFavorite?: boolean
  initialFavoritesCount?: number
  onFavoriteChange?: (isFavorite: boolean, newCount: number) => void
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  showCount?: boolean
}

export function ProductFavoriteButton({
  productId,
  initialIsFavorite = false,
  initialFavoritesCount = 0,
  onFavoriteChange,
  variant = "ghost",
  size = "sm",
  showCount = false,
}: ProductFavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar propagación al card padre

    if (!isAuthenticated || !user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newIsFavorite = await toggleProductFavorite(productId, user.id)
      const newCount = favoritesCount + (newIsFavorite ? 1 : -1)

      setIsFavorite(newIsFavorite)
      setFavoritesCount(newCount)

      toast({
        title: newIsFavorite ? "Agregado a favoritos" : "Eliminado de favoritos",
        description: newIsFavorite
          ? "El producto se guardó en tus favoritos"
          : "El producto se eliminó de tus favoritos",
      })

      onFavoriteChange?.(newIsFavorite, newCount)
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar los favoritos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={isFavorite ? "text-red-500" : "text-gray-400"}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""} ${showCount ? "mr-1" : ""}`} />
      {showCount && <span>{favoritesCount}</span>}
    </Button>
  )
}
