"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { getUserFavoriteProducts, toggleProductFavorite } from '@/services/products.service'

interface FavoritesContextType {
  // Set de IDs de productos que el usuario actual tiene como favoritos
  userFavoriteIds: Set<string>

  // Verificar si el usuario actual tiene un producto como favorito
  isUserFavorite: (productId: string) => boolean

  // Toggle favorito - retorna el nuevo estado (true = agregado, false = eliminado)
  toggleFavorite: (productId: string) => Promise<boolean>

  // Estado de carga inicial
  isLoading: boolean

  // Cantidad de favoritos del usuario
  favoritesCount: number

  // Obtener el contador de favoritos de un producto
  getProductFavoritesCount: (productId: string, fallback: number) => number

  // Inicializar contadores desde productos cargados
  setInitialCounts: (products: { id: string; favorites_count: number | null }[]) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [userFavoriteIds, setUserFavoriteIds] = useState<Set<string>>(new Set())
  const [productFavoritesCount, setProductFavoritesCount] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  // Cargar favoritos cuando el usuario se autentica
  useEffect(() => {
    async function loadFavorites() {
      if (!user || !isAuthenticated) {
        setUserFavoriteIds(new Set())
        return
      }

      setIsLoading(true)
      try {
        const favorites = await getUserFavoriteProducts(user.id)
        const ids = favorites
          .map(f => f.product_id)
          .filter((id): id is string => id !== null)
        setUserFavoriteIds(new Set(ids))
      } catch (error) {
        console.error('Error cargando favoritos:', error)
        setUserFavoriteIds(new Set())
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [user, isAuthenticated])

  // Verificar si un producto es favorito del usuario actual
  const isUserFavorite = useCallback((productId: string): boolean => {
    return userFavoriteIds.has(productId)
  }, [userFavoriteIds])

  // Obtener el contador de favoritos de un producto
  const getProductFavoritesCount = useCallback((productId: string, fallback: number): number => {
    return productFavoritesCount.get(productId) ?? fallback
  }, [productFavoritesCount])

  // Inicializar contadores desde productos cargados
  const setInitialCounts = useCallback((products: { id: string; favorites_count: number | null }[]) => {
    setProductFavoritesCount(prev => {
      const newMap = new Map(prev)
      products.forEach(p => {
        // Solo actualizar si no existe o es mayor (para no sobrescribir cambios del usuario)
        if (!newMap.has(p.id)) {
          newMap.set(p.id, p.favorites_count ?? 0)
        }
      })
      return newMap
    })
  }, [])

  // Toggle favorito
  const toggleFavorite = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('Debes iniciar sesión para guardar favoritos')
    }

    try {
      const newIsFavorite = await toggleProductFavorite(productId, user.id)

      // Actualizar el Set de favoritos del usuario
      setUserFavoriteIds(prev => {
        const newSet = new Set(prev)
        if (newIsFavorite) {
          newSet.add(productId)
        } else {
          newSet.delete(productId)
        }
        return newSet
      })

      // Actualizar el contador del producto
      setProductFavoritesCount(prev => {
        const newMap = new Map(prev)
        const currentCount = newMap.get(productId) ?? 0
        newMap.set(productId, Math.max(0, currentCount + (newIsFavorite ? 1 : -1)))
        return newMap
      })

      return newIsFavorite
    } catch (error) {
      console.error('Error toggling favorito:', error)
      throw error
    }
  }, [user])

  const value: FavoritesContextType = {
    userFavoriteIds,
    isUserFavorite,
    toggleFavorite,
    isLoading,
    favoritesCount: userFavoriteIds.size,
    getProductFavoritesCount,
    setInitialCounts,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
