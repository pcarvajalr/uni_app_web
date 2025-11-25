"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useFavorites } from "@/contexts/favorites-context"
import { useToast } from "@/hooks/use-toast"

interface ProductFavoriteButtonProps {
  productId: string
  initialFavoritesCount?: number
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  showCount?: boolean
}

export function ProductFavoriteButton({
  productId,
  initialFavoritesCount = 0,
  variant = "ghost",
  size = "sm",
  showCount = false,
}: ProductFavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const { isUserFavorite, toggleFavorite, getProductFavoritesCount } = useFavorites()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Obtener estado del favorito y contador desde el contexto
  const isFavorite = isUserFavorite(productId)
  const favoritesCount = getProductFavoritesCount(productId, initialFavoritesCount)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar propagación al card padre

    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newIsFavorite = await toggleFavorite(productId)

      toast({
        title: newIsFavorite ? "Agregado a favoritos" : "Eliminado de favoritos",
        description: newIsFavorite
          ? "El producto se guardó en tus favoritos"
          : "El producto se eliminó de tus favoritos",
      })
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
