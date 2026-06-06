import type React from 'react'

import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MapPin,
  Trash2,
  Save,
  Plus,
  X,
  Map,
  Upload,
  ImageIcon,
  Settings,
  Edit2,
  Loader2,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import {
  getLocationCategories,
  createLocationCategory,
  updateLocationCategory,
  deleteLocationCategory,
} from '@/services/location-categories.service'
import {
  getCampusLocations,
  createCampusLocation,
  updateCampusLocation,
  deleteCampusLocation,
} from '@/services/campus-locations.service'
import { getMapImageUrl, updateMapImageUrl } from '@/services/campus-settings.service'
import {
  uploadLocationImage,
  uploadMapImage,
  validateImageFile,
} from '@/services/storage.service'

import type { Database } from '@/types/database.types'
import { IconSelector } from '@/components/icon-selector'
import type { LocationIconName } from '@/lib/icon-mapper'
import { handleMapImageError } from '@/lib/map-placeholder'

type Category = Database['public']['Tables']['categories']['Row']
type CampusLocation = Database['public']['Tables']['campus_locations']['Row']

const DEFAULT_MAP_IMAGE = '/university-campus-map-layout-with-buildings-and-pa.jpg'

interface LocationFormData {
  name: string
  type: string
  description: string
  floor: string
  hours: string
  icon: LocationIconName | ''
  images: string[]
}

const emptyLocationForm: LocationFormData = {
  name: '',
  type: '',
  description: '',
  floor: '',
  hours: '',
  icon: '',
  images: [],
}

export function MapsLocationsTab({ universityId }: { universityId: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // ---------------------------------------------------------------------------
  // Queries (scoped to universityId)
  // ---------------------------------------------------------------------------
  const {
    data: locationCategories = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['location-categories', universityId],
    queryFn: () => getLocationCategories(universityId),
    enabled: !!universityId,
  })

  const {
    data: campusLocations = [],
    isLoading: isLoadingLocations,
  } = useQuery({
    queryKey: ['campus-locations', universityId],
    queryFn: () => getCampusLocations(universityId),
    enabled: !!universityId,
  })

  const { data: mapImageUrl = DEFAULT_MAP_IMAGE } = useQuery({
    queryKey: ['campus-map-image', universityId],
    queryFn: () => getMapImageUrl(universityId),
    enabled: !!universityId,
  })

  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: ['location-categories', universityId] })
  const invalidateLocations = () =>
    queryClient.invalidateQueries({ queryKey: ['campus-locations', universityId] })
  const invalidateMapImage = () =>
    queryClient.invalidateQueries({ queryKey: ['campus-map-image', universityId] })

  // ---------------------------------------------------------------------------
  // Location categories (Tipos de ubicación) state
  // ---------------------------------------------------------------------------
  const [isLocationCategoriesDialogOpen, setIsLocationCategoriesDialogOpen] = useState(false)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' })

  // ---------------------------------------------------------------------------
  // Map image state (inline upload, scoped to universityId)
  // ---------------------------------------------------------------------------
  const [mapPreviewUrl, setMapPreviewUrl] = useState<string | null>(null)
  const [mapSelectedFile, setMapSelectedFile] = useState<File | null>(null)
  const [isUploadingMap, setIsUploadingMap] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapFileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // Campus locations state
  // ---------------------------------------------------------------------------
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [editingLocation, setEditingLocation] = useState<CampusLocation | null>(null)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [newLocationData, setNewLocationData] = useState<LocationFormData>(emptyLocationForm)
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapImageRef = useRef<HTMLImageElement>(null)

  // ===========================================================================
  // Location categories handlers
  // ===========================================================================
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryFormData({ name: category.name, description: category.description || '' })
    } else {
      setEditingCategory(null)
      setCategoryFormData({ name: '', description: '' })
    }
    setIsLocationCategoriesDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'El nombre de la categoría es obligatorio',
        variant: 'destructive',
      })
      return
    }

    setIsSavingCategory(true)
    try {
      if (editingCategory) {
        await updateLocationCategory(editingCategory.id, {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim() || null,
        })
        toast({
          title: 'Categoría actualizada',
          description: 'La categoría se ha actualizado correctamente',
        })
      } else {
        await createLocationCategory({
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim() || null,
          university_id: universityId,
        })
        toast({
          title: 'Categoría creada',
          description: 'La nueva categoría se ha creado correctamente',
        })
      }

      await invalidateCategories()
      setIsLocationCategoriesDialogOpen(false)
      setCategoryFormData({ name: '', description: '' })
      setEditingCategory(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la categoría',
        variant: 'destructive',
      })
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteLocationCategory(categoryId)
      toast({
        title: 'Categoría eliminada',
        description: 'La categoría se ha eliminado correctamente',
      })
      await invalidateCategories()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la categoría',
        variant: 'destructive',
      })
    }
  }

  // ===========================================================================
  // Map image handlers (inline, scoped to universityId)
  // ===========================================================================
  const handleMapFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMapError(null)

    const validation = validateImageFile(file, 5) // 5MB máximo
    if (!validation.isValid) {
      setMapError(validation.error || 'Archivo inválido')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setMapPreviewUrl(event.target?.result as string)
      setMapSelectedFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleMapUpload = async () => {
    if (!mapSelectedFile) {
      setMapError('No hay archivo seleccionado')
      return
    }

    setIsUploadingMap(true)
    setMapError(null)

    try {
      const uploadResult = await uploadMapImage(mapSelectedFile)

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Error al subir la imagen')
      }

      // Persistir la URL para ESTA universidad
      await updateMapImageUrl(uploadResult.url, universityId)
      await invalidateMapImage()

      toast({
        title: 'Mapa actualizado',
        description: 'La imagen del mapa se ha actualizado correctamente',
      })

      setMapPreviewUrl(null)
      setMapSelectedFile(null)
      if (mapFileInputRef.current) {
        mapFileInputRef.current.value = ''
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen'
      setMapError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsUploadingMap(false)
    }
  }

  const handleMapCancel = () => {
    setMapPreviewUrl(null)
    setMapSelectedFile(null)
    setMapError(null)
    if (mapFileInputRef.current) {
      mapFileInputRef.current.value = ''
    }
  }

  // ===========================================================================
  // Campus locations handlers
  // ===========================================================================
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const img = mapImageRef.current
    if (!img) return

    const imgRect = img.getBoundingClientRect()
    const x = ((event.clientX - imgRect.left) / imgRect.width) * 100
    const y = ((event.clientY - imgRect.top) / imgRect.height) * 100

    if (x < 0 || x > 100 || y < 0 || y > 100) {
      toast({
        title: 'Clic fuera del mapa',
        description: 'Por favor, haz clic dentro de la imagen del mapa',
        variant: 'destructive',
      })
      return
    }

    setSelectedCoordinates({ x, y })
  }

  const resetLocationForm = () => {
    setNewLocationData(emptyLocationForm)
    setSelectedCoordinates(null)
    setEditingLocation(null)
    setSelectedImageFiles([])
  }

  const handleSaveCustomLocation = async () => {
    if (!newLocationData.name.trim() || !selectedCoordinates) {
      toast({
        title: 'Campos requeridos',
        description: 'El nombre y las coordenadas son obligatorios',
        variant: 'destructive',
      })
      return
    }

    if (!newLocationData.icon) {
      toast({
        title: 'Icono requerido',
        description: 'Selecciona un icono para la ubicación',
        variant: 'destructive',
      })
      return
    }

    setIsSavingLocation(true)
    try {
      // Subir nuevas imágenes si hay
      const uploadedImageUrls: string[] = []
      if (selectedImageFiles.length > 0) {
        for (const file of selectedImageFiles) {
          const result = await uploadLocationImage(file, editingLocation?.id)
          if (result.success && result.url) {
            uploadedImageUrls.push(result.url)
          } else {
            console.error('Error uploading image:', result.error)
          }
        }
      }

      const allImages = [...newLocationData.images, ...uploadedImageUrls]

      if (editingLocation) {
        await updateCampusLocation(editingLocation.id, {
          name: newLocationData.name.trim(),
          type: newLocationData.type.trim(),
          description: newLocationData.description.trim() || null,
          floor: newLocationData.floor.trim() || null,
          opening_hours: newLocationData.hours ? { hours: newLocationData.hours } : null,
          coordinate_x: selectedCoordinates.x,
          coordinate_y: selectedCoordinates.y,
          icon: newLocationData.icon,
          images: allImages.length > 0 ? allImages : null,
        })
        toast({
          title: 'Ubicación actualizada',
          description: 'La ubicación se ha actualizado correctamente',
        })
      } else {
        await createCampusLocation({
          name: newLocationData.name.trim(),
          type: newLocationData.type.trim(),
          description: newLocationData.description.trim() || null,
          floor: newLocationData.floor.trim() || null,
          opening_hours: newLocationData.hours ? { hours: newLocationData.hours } : null,
          coordinate_x: selectedCoordinates.x,
          coordinate_y: selectedCoordinates.y,
          icon: newLocationData.icon,
          images: allImages.length > 0 ? allImages : null,
          university_id: universityId,
        })
        toast({
          title: 'Ubicación creada',
          description: 'La nueva ubicación ha sido creada exitosamente',
        })
      }

      await invalidateLocations()
      resetLocationForm()
      setIsLocationModalOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la ubicación',
        variant: 'destructive',
      })
    } finally {
      setIsSavingLocation(false)
    }
  }

  const handleEditLocation = (location: CampusLocation) => {
    setEditingLocation(location)
    setNewLocationData({
      name: location.name,
      type: location.type,
      description: location.description || '',
      floor: location.floor || '',
      hours: location.opening_hours
        ? (location.opening_hours as { hours?: string }).hours || ''
        : '',
      icon: (location.icon || '') as LocationIconName | '',
      images: location.images || [],
    })
    setSelectedCoordinates({
      x: Number(location.coordinate_x),
      y: Number(location.coordinate_y),
    })
    setSelectedImageFiles([])
    setIsLocationModalOpen(true)
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteCampusLocation(locationId)
      toast({
        title: 'Ubicación eliminada',
        description: 'La ubicación se ha eliminado correctamente',
      })
      await invalidateLocations()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la ubicación',
        variant: 'destructive',
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalImages =
      selectedImageFiles.length + newLocationData.images.length + newFiles.length

    if (totalImages > 5) {
      toast({
        title: 'Límite excedido',
        description: 'Solo puedes agregar hasta 5 imágenes por ubicación',
        variant: 'destructive',
      })
      return
    }

    const validFiles: File[] = []
    for (const file of newFiles) {
      const validation = validateImageFile(file, 2) // 2MB max
      if (!validation.isValid) {
        toast({
          title: 'Archivo inválido',
          description: `${file.name}: ${validation.error}`,
          variant: 'destructive',
        })
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setSelectedImageFiles([...selectedImageFiles, ...validFiles])
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles(selectedImageFiles.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (imageUrl: string) => {
    setNewLocationData({
      ...newLocationData,
      images: newLocationData.images.filter((url) => url !== imageUrl),
    })
  }

  const totalImagesCount = selectedImageFiles.length + newLocationData.images.length

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <div className="space-y-6">
      {/* ===================== Tipos de ubicación ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tipos de ubicación
          </CardTitle>
          <CardDescription>
            Gestiona los tipos de ubicación disponibles en el mapa del campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleOpenCategoryDialog()}
            className="w-full"
            disabled={isLoadingCategories}
          >
            {isLoadingCategories ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Configurar tipos de ubicación
              </>
            )}
          </Button>

          <Dialog
            open={isLocationCategoriesDialogOpen}
            onOpenChange={setIsLocationCategoriesDialogOpen}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Tipo de Ubicación' : 'Gestionar Tipos de Ubicación'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? 'Modifica la información del tipo de ubicación'
                    : 'Crea y administra los tipos de ubicación disponibles en el mapa'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium text-sm">
                    {editingCategory ? 'Editar categoría' : 'Crear nueva categoría'}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Nombre *</Label>
                      <Input
                        id="category-name"
                        placeholder="Ej: Académico, Servicios, Recreativo..."
                        value={categoryFormData.name}
                        onChange={(e) =>
                          setCategoryFormData({ ...categoryFormData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category-description">Descripción</Label>
                      <Textarea
                        id="category-description"
                        placeholder="Describe este tipo de ubicación..."
                        value={categoryFormData.description}
                        onChange={(e) =>
                          setCategoryFormData({
                            ...categoryFormData,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      {editingCategory && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(null)
                            setCategoryFormData({ name: '', description: '' })
                          }}
                          disabled={isSavingCategory}
                        >
                          Cancelar edición
                        </Button>
                      )}
                      <Button
                        onClick={handleSaveCategory}
                        disabled={isSavingCategory || !categoryFormData.name.trim()}
                      >
                        {isSavingCategory ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {editingCategory ? 'Actualizar' : 'Crear'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      Categorías existentes ({locationCategories.length})
                    </Label>
                    {editingCategory && locationCategories.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => handleOpenCategoryDialog()}>
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva
                      </Button>
                    )}
                  </div>

                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : locationCategories.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {locationCategories.map((category) => (
                        <div
                          key={category.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            editingCategory?.id === category.id
                              ? 'bg-primary/10 border-primary'
                              : 'bg-background border-border'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{category.name}</p>
                            {category.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenCategoryDialog(category)}
                              className="h-8 w-8 p-0"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay tipos de ubicación configurados</p>
                      <p className="text-xs mt-1">Crea tu primer tipo de ubicación arriba</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLocationCategoriesDialogOpen(false)
                    setEditingCategory(null)
                    setCategoryFormData({ name: '', description: '' })
                  }}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* ===================== Mapa del campus (imagen) ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Mapa del campus
          </CardTitle>
          <CardDescription>
            Configura la imagen del mapa (una sola por universidad) utilizada en todas las
            ubicaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Imagen del mapa del campus</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Sube una imagen que será utilizada como mapa del campus para todas las ubicaciones
              </p>
            </div>

            {/* Imagen actual */}
            {mapImageUrl && !mapPreviewUrl && (
              <div className="border rounded-lg p-2 bg-muted/50">
                <p className="text-sm font-medium mb-2">Imagen actual:</p>
                <div className="aspect-video relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
                  <img
                    src={mapImageUrl}
                    alt="Mapa del campus actual"
                    className="w-full h-full object-contain"
                    onError={handleMapImageError}
                  />
                </div>
              </div>
            )}

            {/* Preview de nueva imagen */}
            {mapPreviewUrl && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Nueva imagen:</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMapCancel}
                    disabled={isUploadingMap}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
                <div className="aspect-video relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
                  <img
                    src={mapPreviewUrl}
                    alt="Preview del nuevo mapa"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {mapError && (
              <Alert variant="destructive">
                <AlertDescription>{mapError}</AlertDescription>
              </Alert>
            )}

            <input
              ref={mapFileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleMapFileSelect}
              className="hidden"
            />

            <div className="flex gap-2">
              {!mapPreviewUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mapFileInputRef.current?.click()}
                  disabled={isUploadingMap}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Imagen
                </Button>
              ) : (
                <Button type="button" onClick={handleMapUpload} disabled={isUploadingMap}>
                  {isUploadingMap ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Actualizar Mapa
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Formatos aceptados: JPG, PNG, WebP</p>
              <p>• Tamaño máximo: 5MB</p>
              <p>• Recomendado: Imagen en formato horizontal (landscape)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================== Ubicaciones ===================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicaciones
          </CardTitle>
          <CardDescription>
            Gestiona las ubicaciones del campus sobre el mapa de esta universidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {locationCategories.length === 0 && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Configura tipos de ubicación primero:</strong> Para crear ubicaciones en el
                mapa, primero debes configurar los tipos de ubicación disponibles en la sección
                <span className="font-semibold"> &quot;Tipos de ubicación&quot;</span> arriba.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label className="text-base font-medium">Crear ubicación del campus</Label>
            <p className="text-sm text-muted-foreground">
              Haz clic en el mapa del campus para seleccionar una ubicación y crear un punto de
              referencia
            </p>

            <Dialog
              open={isLocationModalOpen}
              onOpenChange={(open) => {
                setIsLocationModalOpen(open)
                if (!open) resetLocationForm()
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => resetLocationForm()}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Crear Nueva Ubicación en el Mapa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingLocation ? 'Editar Ubicación del Campus' : 'Crear Ubicación del Campus'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLocation
                      ? 'Modifica la información de la ubicación y ajusta su posición en el mapa'
                      : 'Haz clic en el mapa para seleccionar las coordenadas de tu nueva ubicación'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Seleccionar ubicación en el mapa</Label>
                    <div
                      ref={mapContainerRef}
                      className="w-full max-h-[500px] bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden cursor-crosshair border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex items-center justify-center"
                      onClick={handleMapClick}
                    >
                      <img
                        ref={mapImageRef}
                        src={mapImageUrl}
                        alt="Mapa del Campus Universitario"
                        className="max-w-full max-h-full object-contain block"
                        style={{ maxHeight: '500px' }}
                        onError={handleMapImageError}
                      />

                      {selectedCoordinates && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: `${selectedCoordinates.x}%`,
                            top: `${selectedCoordinates.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                        </div>
                      )}

                      {!selectedCoordinates && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                          <div className="text-center text-white bg-black/50 p-4 rounded-lg">
                            <MapPin className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-semibold">Haz clic en el mapa</p>
                            <p className="text-sm opacity-90">para seleccionar la ubicación</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedCoordinates && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        <strong>Coordenadas seleccionadas:</strong> X:{' '}
                        {selectedCoordinates.x.toFixed(1)}%, Y: {selectedCoordinates.y.toFixed(1)}%
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location-name">Nombre de la ubicación *</Label>
                      <Input
                        id="location-name"
                        placeholder="Ej: Biblioteca central"
                        value={newLocationData.name}
                        onChange={(e) =>
                          setNewLocationData({ ...newLocationData, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location-type">Tipo de ubicación</Label>
                      <Select
                        value={newLocationData.type}
                        onValueChange={(value) =>
                          setNewLocationData({ ...newLocationData, type: value })
                        }
                        disabled={locationCategories.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              locationCategories.length === 0
                                ? 'No hay tipos configurados'
                                : 'Seleccionar tipo'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {locationCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {locationCategories.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Configura tipos de ubicación en la sección &quot;Tipos de ubicación&quot;
                          arriba
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location-floor">Piso/Ubicación</Label>
                      <Input
                        id="location-floor"
                        placeholder="Ej: Segundo piso, Aula 201"
                        value={newLocationData.floor}
                        onChange={(e) =>
                          setNewLocationData({ ...newLocationData, floor: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location-hours">Horarios</Label>
                      <Input
                        id="location-hours"
                        placeholder="Ej: 8:00 AM - 6:00 PM"
                        value={newLocationData.hours}
                        onChange={(e) =>
                          setNewLocationData({ ...newLocationData, hours: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location-description">Descripción</Label>
                    <Textarea
                      id="location-description"
                      placeholder="Describe esta ubicación..."
                      value={newLocationData.description}
                      onChange={(e) =>
                        setNewLocationData({ ...newLocationData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <IconSelector
                    value={newLocationData.icon ? (newLocationData.icon as LocationIconName) : null}
                    onChange={(iconName) =>
                      setNewLocationData({ ...newLocationData, icon: iconName })
                    }
                    label="Icono de la ubicación"
                    required
                  />

                  {/* Sección de imágenes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Imágenes de la ubicación (opcional)</Label>
                      <span className="text-xs text-muted-foreground">{totalImagesCount}/5</span>
                    </div>

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    {totalImagesCount < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Agregar Imágenes
                      </Button>
                    )}

                    {newLocationData.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Imágenes existentes:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {newLocationData.images.map((imageUrl, index) => (
                            <div key={imageUrl} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveExistingImage(imageUrl)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedImageFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Nuevas imágenes:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedImageFiles.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded truncate">
                                {file.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      • Formatos: JPG, PNG, WebP • Tamaño máximo: 2MB por imagen • Máximo: 5 imágenes
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLocationModalOpen(false)
                      resetLocationForm()
                    }}
                    disabled={isSavingLocation}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveCustomLocation}
                    disabled={
                      !newLocationData.name.trim() ||
                      !selectedCoordinates ||
                      !newLocationData.icon ||
                      isSavingLocation
                    }
                  >
                    {isSavingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingLocation ? 'Actualizar Ubicación' : 'Guardar Ubicación'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Lista de ubicaciones creadas */}
            <div className="space-y-3 mt-4">
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Ubicaciones del Campus ({campusLocations.length})
                </Label>
              </div>

              {isLoadingLocations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : campusLocations.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {campusLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{location.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {location.type}
                          </Badge>
                        </div>
                        {location.description && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {location.description}
                          </p>
                        )}
                        {location.floor && (
                          <div className="text-xs text-muted-foreground">{location.floor}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLocation(location)}
                          className="h-8 w-8 p-0"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLocation(location.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay ubicaciones del campus configuradas</p>
                  <p className="text-xs mt-1">Crea tu primera ubicación usando el botón arriba</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
