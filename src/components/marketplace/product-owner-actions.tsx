"use client"

import { useState } from "react"
import { Pencil, Trash2, CheckCircle, XCircle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { markProductAsSold, markProductAsAvailable, deleteProduct, type ProductWithSeller } from "@/services/products.service"

interface ProductOwnerActionsProps {
  product: ProductWithSeller
  onUpdate?: () => void
  onEdit?: () => void
}

export function ProductOwnerActions({ product, onUpdate, onEdit }: ProductOwnerActionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si el usuario es el propietario
  const isOwner = user?.id === product.seller_id
  if (!isOwner) return null

  const handleMarkAsSold = async () => {
    setIsLoading(true)
    try {
      await markProductAsSold(product.id)
      toast({
        title: "Producto marcado como vendido",
        description: "El producto ya no aparecerá en las búsquedas",
      })
      onUpdate?.()
    } catch (error) {
      console.error("Error marking as sold:", error)
      toast({
        title: "Error",
        description: "No se pudo marcar como vendido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsAvailable = async () => {
    setIsLoading(true)
    try {
      await markProductAsAvailable(product.id)
      toast({
        title: "Producto marcado como disponible",
        description: "El producto volverá a aparecer en las búsquedas",
      })
      onUpdate?.()
    } catch (error) {
      console.error("Error marking as available:", error)
      toast({
        title: "Error",
        description: "No se pudo marcar como disponible",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteProduct(product.id)
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente",
      })
      setShowDeleteDialog(false)
      onUpdate?.()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <MoreVertical className="h-4 w-4 mr-2" />
            Gestionar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit} disabled={isLoading}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {product.status === 'available' ? (
            <DropdownMenuItem onClick={handleMarkAsSold} disabled={isLoading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Marcar como vendido
            </DropdownMenuItem>
          ) : product.status === 'sold' ? (
            <DropdownMenuItem onClick={handleMarkAsAvailable} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" />
              Marcar como disponible
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isLoading}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
