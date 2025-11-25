"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { createProduct } from "@/services/products.service"
import { uploadFile } from "@/services/storage.service"
import { createProductSchema, validateImageFiles, type CreateProductFormData } from "@/lib/product-validation"
import type { Database } from "@/types/database.types"

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated?: () => void
}

type Category = Database['public']['Tables']['categories']['Row']

export function CreateProductDialog({ open, onOpenChange, onProductCreated }: CreateProductDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      location: '',
      is_negotiable: true,
    },
  })

  const isNegotiable = watch('is_negotiable')
  const selectedCondition = watch('condition')

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

  const conditions = [
    { value: "new", label: "Nuevo" },
    { value: "like_new", label: "Como Nuevo" },
    { value: "good", label: "Bueno" },
    { value: "fair", label: "Regular" },
    { value: "poor", label: "Malo" },
  ] as const

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles = Array.from(files)
    const allFiles = [...imageFiles, ...newFiles].slice(0, 5)

    // Validar archivos
    const validation = validateImageFiles(allFiles)
    if (!validation.valid) {
      toast({
        title: 'Error en las imágenes',
        description: validation.error,
        variant: 'destructive',
      })
      return
    }

    // Crear previews
    const newPreviews = allFiles.map(file => URL.createObjectURL(file))

    setImageFiles(allFiles)
    setImagePreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    // Limpiar URL del preview
    URL.revokeObjectURL(imagePreviews[index])

    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) {
      throw new Error('Debes subir al menos 1 imagen')
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const progress = ((i + 1) / imageFiles.length) * 100
      setUploadProgress(progress)

      try {
        const result = await uploadFile('products', file, user!.id)
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

  const onSubmit = async (data: CreateProductFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para publicar productos',
        variant: 'destructive',
      })
      return
    }

    if (imageFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes subir al menos 1 imagen',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // 1. Subir imágenes a Supabase Storage
      const imageUrls = await uploadImages()

      // 2. Crear el producto en la base de datos
      await createProduct({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        condition: data.condition,
        location: data.location,
        is_negotiable: data.is_negotiable,
        images: imageUrls,
        tags: data.tags,
      })

      // 3. Mostrar mensaje de éxito
      toast({
        title: 'Producto publicado',
        description: 'Tu producto ha sido publicado exitosamente',
      })

      // 4. Limpiar formulario
      reset()
      setImageFiles([])
      setImagePreviews([])
      setUploadProgress(0)

      // 5. Notificar al componente padre
      onProductCreated?.()

      // 6. Cerrar diálogo
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo publicar el producto',
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
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar Producto</DialogTitle>
          <DialogDescription>Crea una nueva publicación para vender tu producto</DialogDescription>
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
              <Select
                value={watch('category_id')}
                onValueChange={(value) => setValue('category_id', value)}
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
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condición *</Label>
              <Select
                value={selectedCondition}
                onValueChange={(value) => setValue('condition', value as any)}
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
                {...register('price', { valueAsNumber: true })}
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
            <Switch
              id="is_negotiable"
              checked={isNegotiable}
              onCheckedChange={(checked) => setValue('is_negotiable', checked)}
            />
            <Label htmlFor="is_negotiable" className="cursor-pointer">
              Precio negociable
            </Label>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imágenes * (máximo 5)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={imageFiles.length >= 5 || isSubmitting}
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center cursor-pointer ${
                  imageFiles.length >= 5 || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {imageFiles.length >= 5
                    ? "Máximo 5 imágenes"
                    : `Haz clic para subir imágenes (${imageFiles.length}/5)`}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG, WebP (máx. 5MB cada una)
                </span>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subiendo imágenes...</span>
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
                  Publicando...
                </>
              ) : (
                "Publicar Producto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
