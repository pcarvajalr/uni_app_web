"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { updateProduct, type ProductWithSeller } from "@/services/products.service"
import { uploadProductImage, deleteProductImage } from "@/services/storage.service"
import { createProductSchema, validateImageFiles, type CreateProductFormData } from "@/lib/product-validation"
import type { Database } from "@/types/database.types"

interface EditProductDialogProps {
  product: ProductWithSeller
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductUpdated?: () => void
}

type Category = Database['public']['Tables']['categories']['Row']

export function EditProductDialog({ product, open, onOpenChange, onProductUpdated }: EditProductDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Imágenes existentes del producto
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  // Nuevas imágenes a subir
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      location: '',
      category_id: '',
      condition: undefined,
      price: undefined,
      is_negotiable: true,
    },
  })

  const isNegotiable = watch('is_negotiable')

  // Cargar categorías de productos
  useEffect(() => {
    async function loadCategories() {
      try {
        const { getProductCategories } = await import('@/services/products.service')
        const data = await getProductCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las categorías',
          variant: 'destructive',
        })
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [toast])

  // Prellenar formulario con datos del producto
  useEffect(() => {
    if (open && product) {
      reset({
        title: product.title,
        description: product.description,
        location: product.location || '',
        category_id: product.category_id || '',
        condition: product.condition as any,
        price: product.price,
        is_negotiable: product.is_negotiable ?? true,
        tags: product.tags || undefined,
      })

      // Cargar imágenes existentes
      setExistingImages(product.images || [])
      setDeletedImages([])
      setNewImageFiles([])
      setNewImagePreviews([])
    }
  }, [open, product, reset])

  // Resetear al cerrar
  useEffect(() => {
    if (!open) {
      setDeletedImages([])
      setNewImageFiles([])
      setNewImagePreviews([])
    }
  }, [open])

  const conditions = [
    { value: "new", label: "Nuevo" },
    { value: "like_new", label: "Como Nuevo" },
    { value: "good", label: "Bueno" },
    { value: "fair", label: "Regular" },
    { value: "poor", label: "Malo" },
  ] as const

  // Total de imágenes (existentes no eliminadas + nuevas)
  const totalImages = existingImages.filter(img => !deletedImages.includes(img)).length + newImageFiles.length

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    const allFiles = [...newImageFiles, ...newFiles]

    // Validar que no exceda el límite de 5 imágenes totales
    if (totalImages + newFiles.length > 5) {
      toast({
        title: 'Límite de imágenes',
        description: `Solo puedes tener un máximo de 5 imágenes. Actualmente tienes ${totalImages}`,
        variant: 'destructive',
      })
      return
    }

    const filesToAdd = allFiles.slice(0, 5 - (totalImages - newImageFiles.length))

    // Validar archivos
    const validation = validateImageFiles(filesToAdd)
    if (!validation.valid) {
      toast({
        title: 'Error en las imágenes',
        description: validation.error,
        variant: 'destructive',
      })
      return
    }

    // Crear previews
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))

    setNewImageFiles(filesToAdd)
    setNewImagePreviews(newPreviews)
  }

  const removeExistingImage = (imageUrl: string) => {
    setDeletedImages(prev => [...prev, imageUrl])
  }

  const restoreExistingImage = (imageUrl: string) => {
    setDeletedImages(prev => prev.filter(img => img !== imageUrl))
  }

  const removeNewImage = (index: number) => {
    // Limpiar URL del preview
    URL.revokeObjectURL(newImagePreviews[index])

    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImageFiles.length === 0) {
      return []
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i]
      const progress = ((i + 1) / newImageFiles.length) * 50 // 50% del progreso total
      setUploadProgress(progress)

      try {
        const result = await uploadProductImage(file, user!.id)
        if (!result.success || !result.url) {
          throw new Error(result.error || 'Error al subir imagen')
        }
        uploadedUrls.push(result.url)
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error)
        throw new Error(`Error al subir imagen ${i + 1}`)
      }
    }

    return uploadedUrls
  }

  const deleteRemovedImages = async () => {
    if (deletedImages.length === 0) return

    setUploadProgress(75)

    const deletePromises = deletedImages.map(imageUrl => deleteProductImage(imageUrl))
    const results = await Promise.all(deletePromises)

    const failedDeletes = results.filter(result => !result).length
    if (failedDeletes > 0) {
      console.warn(`${failedDeletes} imágenes no pudieron ser eliminadas del storage`)
    }
  }

  const onSubmit = async (data: CreateProductFormData) => {
    // Limpiar espacios en blanco de los campos de texto
    const cleanedData = {
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para editar productos',
        variant: 'destructive',
      })
      return
    }

    // Validar que haya al menos 1 imagen después de eliminar
    const remainingExistingImages = existingImages.filter(img => !deletedImages.includes(img))
    if (remainingExistingImages.length + newImageFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes tener al menos 1 imagen en el producto',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // 1. Subir nuevas imágenes a Supabase Storage
      const newImageUrls = await uploadNewImages()

      // 2. Construir array final de imágenes (existentes no eliminadas + nuevas)
      const finalImages = [...remainingExistingImages, ...newImageUrls]

      setUploadProgress(60)

      // 3. Actualizar el producto en la base de datos
      await updateProduct(product.id, {
        title: cleanedData.title,
        description: cleanedData.description,
        price: cleanedData.price,
        category_id: cleanedData.category_id,
        condition: cleanedData.condition,
        location: cleanedData.location,
        is_negotiable: cleanedData.is_negotiable,
        images: finalImages,
        tags: cleanedData.tags,
      })

      setUploadProgress(70)

      // 4. Eliminar imágenes marcadas para eliminación del storage
      await deleteRemovedImages()

      setUploadProgress(100)

      // 5. Mostrar mensaje de éxito
      toast({
        title: 'Producto actualizado',
        description: 'Los cambios han sido guardados exitosamente',
      })

      // Notificar al componente padre
      onProductUpdated?.()

      // Cerrar diálogo
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el producto',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // Limpiar previews al desmontar
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newImagePreviews])

  // Calcular imágenes activas para mostrar
  const activeExistingImages = existingImages.filter(img => !deletedImages.includes(img))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Actualiza la información de tu producto</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Producto *</Label>
            <Input
              id="title"
              placeholder="Ej: iPhone 13 Pro Max 256GB"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría *</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona categoría"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condición *</Label>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado del producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.condition && (
                <p className="text-sm text-red-500">{errors.condition.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="50000"
                {...register('price', {
                  setValueAs: (v) => v === '' ? undefined : parseFloat(v)
                })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                placeholder="Campus Norte"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe tu producto, incluye detalles importantes como estado, accesorios incluidos, etc."
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="is_negotiable"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_negotiable"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_negotiable" className="cursor-pointer">
              Precio negociable
            </Label>
          </div>

          {/* Image Management */}
          <div className="space-y-2">
            <Label>Imágenes * (máximo 5, actual: {totalImages})</Label>

            {/* Imágenes existentes */}
            {activeExistingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Imágenes actuales:</p>
                <div className="grid grid-cols-3 gap-2">
                  {activeExistingImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Existente ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeExistingImage(imageUrl)}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Imágenes eliminadas (con opción de restaurar) */}
            {deletedImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Imágenes a eliminar:</p>
                <div className="grid grid-cols-3 gap-2">
                  {deletedImages.map((imageUrl, index) => (
                    <div key={`deleted-${index}`} className="relative opacity-50">
                      <img
                        src={imageUrl}
                        alt={`Eliminada ${index + 1}`}
                        className="w-full h-20 object-cover rounded grayscale"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs"
                        onClick={() => restoreExistingImage(imageUrl)}
                        disabled={isSubmitting}
                        title="Restaurar"
                      >
                        ↶
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nuevas imágenes */}
            {newImagePreviews.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nuevas imágenes:</p>
                <div className="grid grid-cols-3 gap-2">
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={preview}
                        alt={`Nueva ${index + 1}`}
                        className="w-full h-20 object-cover rounded border-2 border-green-500"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeNewImage(index)}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload de nuevas imágenes */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleNewImageUpload}
                className="hidden"
                id="new-image-upload"
                disabled={totalImages >= 5 || isSubmitting}
              />
              <label
                htmlFor="new-image-upload"
                className={`flex flex-col items-center justify-center cursor-pointer ${
                  totalImages >= 5 || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {totalImages >= 5
                    ? "Máximo 5 imágenes alcanzado"
                    : `Agregar más imágenes (${totalImages}/5)`}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG, WebP (máx. 5MB cada una)
                </span>
              </label>
            </div>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Guardando cambios...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
