import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { Bell, MapPin, Shield, Palette, Download, Trash2, Save, Plus, X, Map, Ticket, Upload, ImageIcon, Settings, Edit2, Loader2, Info, BookOpen } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  getLocationCategories,
  createLocationCategory,
  updateLocationCategory,
  deleteLocationCategory,
} from "@/services/location-categories.service"
import {
  getTutoringSubjects,
  createTutoringSubject,
  updateTutoringSubject,
  deleteTutoringSubject,
} from "@/services/tutoring-subjects.service"
import {
  getCampusLocations,
  createCampusLocation,
  updateCampusLocation,
  deleteCampusLocation,
} from "@/services/campus-locations.service"
import { getMapImageUrl } from "@/services/campus-settings.service"
import { uploadLocationImage, validateImageFile } from "@/services/storage.service"
import {
  getUserFavoriteLocations,
  toggleLocationFavorite,
} from "@/services/location-favorites.service"
import {
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  uploadCouponImage,
} from "@/services/coupons.service"
import type { Database } from "@/types/database.types"
import { IconSelector } from "@/components/icon-selector"
import { MapImageUploader } from "@/components/map-image-uploader"
import { FavoriteLocationsModal } from "@/components/FavoriteLocationsModal"
import type { LocationIconName } from "@/lib/icon-mapper"

type Category = Database['public']['Tables']['categories']['Row']
type CampusLocation = Database['public']['Tables']['campus_locations']['Row']
type Coupon = Database['public']['Tables']['coupons']['Row']
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ... existing imports and interface ...

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  // ... existing state ...

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [isSavingCoupon, setIsSavingCoupon] = useState(false)
  const [couponImageFile, setCouponImageFile] = useState<File | null>(null)
  const [newCoupon, setNewCoupon] = useState({
    title: "",
    discount: "",
    code: "",
    expiry: "",
    category: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed_amount",
    image: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ... existing notification state ...
  const [notifications, setNotifications] = useState({
    reports: true,
    marketplace: true,
    tutoring: true,
    security: true,
    general: false,
  })

  const [favoriteLocations, setFavoriteLocations] = useState<CampusLocation[]>([])
  const [isFavoriteLocationsModalOpen, setIsFavoriteLocationsModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ x: number; y: number } | null>(null)
  const [newLocationData, setNewLocationData] = useState({
    name: "",
    type: "",
    description: "",
    floor: "",
    hours: "",
    icon: "" as LocationIconName | "",
    images: [] as string[],
  })

  // Estado para archivos de imágenes seleccionados
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Refs para el mapa de configuración
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapImageRef = useRef<HTMLImageElement>(null)

  // Campus locations state
  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [editingLocation, setEditingLocation] = useState<CampusLocation | null>(null)
  const [mapImageUrl, setMapImageUrl] = useState("/university-campus-map-layout-with-buildings-and-pa.jpg")

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showContact: false,
    showCareer: true,
  })

  const [appSettings, setAppSettings] = useState({
    darkMode: false,
    language: "es",
  })

  // Location categories state
  const [locationCategories, setLocationCategories] = useState<Category[]>([])
  const [isLocationCategoriesDialogOpen, setIsLocationCategoriesDialogOpen] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  })

  // Tutoring subjects state
  const [tutoringSubjects, setTutoringSubjects] = useState<Category[]>([])
  const [isTutoringSubjectsDialogOpen, setIsTutoringSubjectsDialogOpen] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [isSavingSubject, setIsSavingSubject] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Category | null>(null)
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    description: "",
  })

  // Load coupons on component mount
  // Cargar cupones desde Supabase
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const allCoupons = await getAllCoupons()
        setCoupons(allCoupons)
      } catch (error) {
        console.error('Error cargando cupones:', error)
        // No mostrar toast aquí para no molestar al usuario al cargar
      }
    }

    loadCoupons()
  }, [])

  // Load location categories
  const loadLocationCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const categories = await getLocationCategories()
      setLocationCategories(categories)
    } catch (error) {
      console.error('Error cargando categorías de ubicación:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de ubicación",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  // Load tutoring subjects
  const loadTutoringSubjects = async () => {
    setIsLoadingSubjects(true)
    try {
      const subjects = await getTutoringSubjects()
      setTutoringSubjects(subjects)
    } catch (error) {
      console.error('Error cargando materias de tutoría:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las materias de tutoría",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  // Load campus locations
  const loadCampusLocations = async () => {
    setIsLoadingLocations(true)
    try {
      const locations = await getCampusLocations()
      setCampusLocations(locations)
    } catch (error) {
      console.error('Error cargando ubicaciones del campus:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ubicaciones del campus",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLocations(false)
    }
  }

  // Load map image URL
  const loadMapImageUrl = async () => {
    try {
      const url = await getMapImageUrl()
      setMapImageUrl(url)
    } catch (error) {
      console.error('Error cargando URL de la imagen del mapa:', error)
    }
  }

  // Load favorite locations from database
  const loadFavoriteLocations = async () => {
    if (!user) return
    try {
      const favorites = await getUserFavoriteLocations(user.id)
      // Extract campus_location from favorites
      const locations = favorites
        .map((fav: any) => fav.campus_location)
        .filter((loc: any) => loc !== null) as CampusLocation[]
      setFavoriteLocations(locations)
    } catch (error) {
      console.error('Error cargando ubicaciones favoritas:', error)
    }
  }

  useEffect(() => {
    loadLocationCategories()
    loadTutoringSubjects()
    loadCampusLocations()
    loadMapImageUrl()
    loadFavoriteLocations()
  }, [])

  // ... existing handlers ...

  const handleRemoveFavoriteLocation = async (locationId: string) => {
    if (!user) return
    try {
      await toggleLocationFavorite(locationId, user.id)
      await loadFavoriteLocations()
      toast({
        title: "Ubicación eliminada",
        description: "La ubicación ha sido removida de tus favoritos.",
      })
    } catch (error) {
      console.error('Error eliminando favorito:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la ubicación de favoritos",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    toast({
      title: "Exportando datos",
      description: "Se enviará un archivo con tus datos a tu correo.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud de eliminación de cuenta ha sido procesada.",
      variant: "destructive",
    })
  }

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const img = mapImageRef.current
    if (!img) return

    // Obtener dimensiones de la imagen renderizada (no del contenedor)
    const imgRect = img.getBoundingClientRect()

    // Calcular coordenadas relativas a la imagen VISIBLE
    const x = ((event.clientX - imgRect.left) / imgRect.width) * 100
    const y = ((event.clientY - imgRect.top) / imgRect.height) * 100

    // Verificar que el clic fue dentro de la imagen
    if (x < 0 || x > 100 || y < 0 || y > 100) {
      toast({
        title: "Clic fuera del mapa",
        description: "Por favor, haz clic dentro de la imagen del mapa",
        variant: "destructive",
      })
      return
    }

    setSelectedCoordinates({ x, y })
  }

  const handleSaveCustomLocation = async () => {
    if (!newLocationData.name.trim() || !selectedCoordinates) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y las coordenadas son obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!newLocationData.icon) {
      toast({
        title: "Icono requerido",
        description: "Selecciona un icono para la ubicación",
        variant: "destructive",
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

      // Combinar imágenes existentes con las nuevas
      const allImages = [...newLocationData.images, ...uploadedImageUrls]

      if (editingLocation) {
        // Update existing location
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
          title: "Ubicación actualizada",
          description: "La ubicación se ha actualizado correctamente",
        })
      } else {
        // Create new location
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
        })
        toast({
          title: "Ubicación creada",
          description: "La nueva ubicación ha sido creada exitosamente",
        })
      }

      // Reload locations
      await loadCampusLocations()

      // Reset form
      setNewLocationData({
        name: "",
        type: "",
        description: "",
        floor: "",
        hours: "",
        icon: "",
        images: [],
      })
      setSelectedCoordinates(null)
      setEditingLocation(null)
      setSelectedImageFiles([])
      setIsLocationModalOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la ubicación",
        variant: "destructive",
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
      description: location.description || "",
      floor: location.floor || "",
      hours: location.opening_hours ? (location.opening_hours as any).hours || "" : "",
      icon: (location.icon || "") as LocationIconName | "",
      images: location.images || [],
    })
    setSelectedCoordinates({
      x: Number(location.coordinate_x),
      y: Number(location.coordinate_y),
    })
    setSelectedImageFiles([]) // Reset new files
    setIsLocationModalOpen(true)
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteCampusLocation(locationId)
      toast({
        title: "Ubicación eliminada",
        description: "La ubicación se ha eliminado correctamente",
      })
      await loadCampusLocations()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la ubicación",
        variant: "destructive",
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    const totalImages = selectedImageFiles.length + newFiles.length

    if (totalImages > 5) {
      toast({
        title: "Límite excedido",
        description: "Solo puedes agregar hasta 5 imágenes por ubicación",
        variant: "destructive",
      })
      return
    }

    // Validar cada archivo
    const validFiles: File[] = []
    for (const file of newFiles) {
      const validation = validateImageFile(file, 2) // 2MB max
      if (!validation.isValid) {
        toast({
          title: "Archivo inválido",
          description: `${file.name}: ${validation.error}`,
          variant: "destructive",
        })
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      setSelectedImageFiles([...selectedImageFiles, ...validFiles])
    }

    // Reset input
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Guardar el archivo para subirlo después
      setCouponImageFile(file)

      // Leer como data URL para preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCoupon({ ...newCoupon, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCoupon = async () => {
    // Validar campos requeridos
    if (
      !newCoupon.title.trim() ||
      !newCoupon.discount.trim() ||
      !newCoupon.code.trim() ||
      !newCoupon.expiry.trim() ||
      !couponImageFile
    ) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos e incluye una imagen.",
        variant: "destructive",
      })
      return
    }

    setIsSavingCoupon(true)

    try {
      // 1. Subir imagen a Storage
      const imageUrl = await uploadCouponImage(couponImageFile, newCoupon.code.toUpperCase())

      // 2. Parsear el descuento (puede ser "20%" o "20" para porcentaje, o "$10" para fixed_amount)
      let discountType: 'percentage' | 'fixed_amount' = newCoupon.discountType
      let discountValue = 0

      const discountStr = newCoupon.discount.trim()
      if (discountStr.includes('%')) {
        discountType = 'percentage'
        discountValue = parseFloat(discountStr.replace('%', ''))
      } else if (discountStr.includes('$')) {
        discountType = 'fixed_amount'
        discountValue = parseFloat(discountStr.replace('$', ''))
      } else {
        // Si no tiene símbolo, usar el tipo seleccionado
        discountValue = parseFloat(discountStr)
      }

      // Validar que el descuento sea un número válido
      if (isNaN(discountValue) || discountValue <= 0) {
        throw new Error('El valor del descuento debe ser un número válido mayor a 0')
      }

      // 3. Convertir la fecha de expiración a timestamp ISO
      const validUntil = new Date(newCoupon.expiry).toISOString()

      // 4. Crear el cupón en Supabase
      const couponData = {
        code: newCoupon.code.toUpperCase(),
        title: newCoupon.title.trim(),
        description: newCoupon.description.trim() || null,
        discount_type: discountType,
        discount_value: discountValue,
        image_url: imageUrl,
        valid_until: validUntil,
        applicable_to: newCoupon.category as 'products' | 'tutoring' | 'both' | null,
        is_active: true,
      }

      const savedCoupon = await createCoupon(couponData)

      // 5. Actualizar estado local
      setCoupons([savedCoupon, ...coupons])

      // 6. Limpiar formulario
      setNewCoupon({
        title: "",
        discount: "",
        code: "",
        expiry: "",
        category: "",
        description: "",
        discountType: "percentage",
        image: "",
      })
      setCouponImageFile(null)
      setIsCouponModalOpen(false)

      toast({
        title: "Cupón creado",
        description: "El cupón ha sido guardado exitosamente en la base de datos.",
      })
    } catch (error: any) {
      console.error('Error creando cupón:', error)
      toast({
        title: "Error al crear cupón",
        description: error.message || "Hubo un error al guardar el cupón. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSavingCoupon(false)
    }
  }

  const handleRemoveCoupon = async (couponId: string) => {
    try {
      // Eliminar de Supabase
      await deleteCoupon(couponId)

      // Actualizar estado local
      const updatedCoupons = coupons.filter((c) => c.id !== couponId)
      setCoupons(updatedCoupons)

      toast({
        title: "Cupón eliminado",
        description: "El cupón ha sido removido exitosamente.",
      })
    } catch (error: any) {
      console.error('Error eliminando cupón:', error)
      toast({
        title: "Error al eliminar cupón",
        description: error.message || "Hubo un error al eliminar el cupón.",
        variant: "destructive",
      })
    }
  }

  // Location Categories Handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryFormData({
        name: category.name,
        description: category.description || "",
      })
    } else {
      setEditingCategory(null)
      setCategoryFormData({
        name: "",
        description: "",
      })
    }
    setIsLocationCategoriesDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      toast({
        title: "Campo requerido",
        description: "El nombre de la categoría es obligatorio",
        variant: "destructive",
      })
      return
    }

    setIsSavingCategory(true)
    try {
      if (editingCategory) {
        // Update
        await updateLocationCategory(editingCategory.id, {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim() || null,
        })
        toast({
          title: "Categoría actualizada",
          description: "La categoría se ha actualizado correctamente",
        })
      } else {
        // Create
        await createLocationCategory({
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim() || null,
        })
        toast({
          title: "Categoría creada",
          description: "La nueva categoría se ha creado correctamente",
        })
      }

      await loadLocationCategories()
      setIsLocationCategoriesDialogOpen(false)
      setCategoryFormData({ name: "", description: "" })
      setEditingCategory(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la categoría",
        variant: "destructive",
      })
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteLocationCategory(categoryId)
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente",
      })
      await loadLocationCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  // Tutoring Subjects Handlers
  const handleOpenSubjectDialog = (subject?: Category) => {
    if (subject) {
      setEditingSubject(subject)
      setSubjectFormData({
        name: subject.name,
        description: subject.description || "",
      })
    } else {
      setEditingSubject(null)
      setSubjectFormData({
        name: "",
        description: "",
      })
    }
    setIsTutoringSubjectsDialogOpen(true)
  }

  const handleSaveSubject = async () => {
    if (!subjectFormData.name.trim()) {
      toast({
        title: "Campo requerido",
        description: "El nombre de la materia es obligatorio",
        variant: "destructive",
      })
      return
    }

    setIsSavingSubject(true)
    try {
      if (editingSubject) {
        await updateTutoringSubject(editingSubject.id, {
          name: subjectFormData.name.trim(),
          description: subjectFormData.description.trim() || null,
        })
        toast({
          title: "Materia actualizada",
          description: "La materia se ha actualizado correctamente",
        })
      } else {
        await createTutoringSubject({
          name: subjectFormData.name.trim(),
          description: subjectFormData.description.trim() || null,
        })
        toast({
          title: "Materia creada",
          description: "La nueva materia se ha creado correctamente",
        })
      }

      await loadTutoringSubjects()
      setIsTutoringSubjectsDialogOpen(false)
      setSubjectFormData({ name: "", description: "" })
      setEditingSubject(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la materia",
        variant: "destructive",
      })
    } finally {
      setIsSavingSubject(false)
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteTutoringSubject(subjectId)
      toast({
        title: "Materia eliminada",
        description: "La materia se ha eliminado correctamente",
      })
      // Si se está editando la materia eliminada, resetear el formulario
      if (editingSubject?.id === subjectId) {
        setEditingSubject(null)
        setSubjectFormData({ name: "", description: "" })
      }
      await loadTutoringSubjects()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la materia",
        variant: "destructive",
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia en UniApp</p>
        </div>

        {/* Location Categories Settings */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Tipos de Ubicación
              </CardTitle>
              <CardDescription>Gestiona los tipos de ubicación disponibles en el mapa del campus</CardDescription>
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

            {/* Location Categories Dialog */}
            <Dialog open={isLocationCategoriesDialogOpen} onOpenChange={setIsLocationCategoriesDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Tipo de Ubicación" : "Gestionar Tipos de Ubicación"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Modifica la información del tipo de ubicación"
                      : "Crea y administra los tipos de ubicación disponibles en el mapa"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Formulario de creación/edición */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-medium text-sm">
                      {editingCategory ? "Editar categoría" : "Crear nueva categoría"}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">Nombre *</Label>
                        <Input
                          id="category-name"
                          placeholder="Ej: Académico, Servicios, Recreativo..."
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category-description">Descripción</Label>
                        <Textarea
                          id="category-description"
                          placeholder="Describe este tipo de ubicación..."
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
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
                              setCategoryFormData({ name: "", description: "" })
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
                              {editingCategory ? "Actualizar" : "Crear"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Lista de categorías existentes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        Categorías existentes ({locationCategories.length})
                      </Label>
                      {editingCategory && locationCategories.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCategoryDialog()}
                        >
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
                            className={`flex items-start gap-3 p-3 rounded-lg border ${editingCategory?.id === category.id
                                ? "bg-primary/10 border-primary"
                                : "bg-background border-border"
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
                      setCategoryFormData({ name: "", description: "" })
                    }}
                  >
                    Cerrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        )}

        {/* Map Image Configuration - Admin Only */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Imagen del Mapa del Campus
              </CardTitle>
              <CardDescription>Configura la imagen del mapa utilizada en todas las ubicaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <MapImageUploader
                currentImageUrl={mapImageUrl}
                onUploadSuccess={(newUrl) => {
                  setMapImageUrl(newUrl)
                  toast({
                    title: "Mapa actualizado",
                    description: "La imagen del mapa se ha actualizado. Recarga la página para ver los cambios.",
                  })
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Map Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Configuración de Mapas
            </CardTitle>
            <CardDescription>Gestiona tus ubicaciones favoritas del campus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationCategories.length === 0 && user?.role === 'admin' && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Configura tipos de ubicación primero:</strong> Para crear ubicaciones personalizadas en el mapa,
                  primero debes configurar los tipos de ubicación disponibles en la sección
                  <span className="font-semibold"> "Tipos de Ubicación"</span> arriba.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Ubicaciones favoritas</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavoriteLocationsModalOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar favoritos
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {favoriteLocations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tienes ubicaciones favoritas. Haz clic en "Gestionar favoritos" para agregar.
                  </p>
                ) : (
                  favoriteLocations.map((location) => (
                    <Badge key={location.id} variant="secondary" className="flex items-center gap-1">
                      {location.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveFavoriteLocation(location.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            {/*Crear Ubicación Personalizada*/}
            {user?.role === 'admin' && (
              <div className="space-y-3">
                <Separator />
                <Label className="text-base font-medium">Crear Ubicación del Campus</Label>
              <p className="text-sm text-muted-foreground">
                Haz clic en el mapa del campus para seleccionar una ubicación y crear tu propio punto de referencia
              </p>

              <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}> 
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Map className="h-4 w-4 mr-2" />
                    Crear Nueva Ubicación en el Mapa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLocation ? "Editar Ubicación del Campus" : "Crear Ubicación del Campus"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingLocation
                        ? "Modifica la información de la ubicación y ajusta su posición en el mapa"
                        : "Haz clic en el mapa para seleccionar las coordenadas de tu nueva ubicación"}
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
                        />

                        {selectedCoordinates && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: `${selectedCoordinates.x}%`,
                              top: `${selectedCoordinates.y}%`,
                              transform: 'translate(-50%, -50%)'
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
                          <strong>Coordenadas seleccionadas:</strong> X: {selectedCoordinates.x.toFixed(1)}%, Y:{" "}
                          {selectedCoordinates.y.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location-name">Nombre de la ubicación *</Label>
                        <Input
                          id="location-name"
                          placeholder="Ej: Mi aula favorita"
                          value={newLocationData.name}
                          onChange={(e) => setNewLocationData({ ...newLocationData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location-type">Tipo de ubicación</Label>
                        <Select
                          value={newLocationData.type}
                          onValueChange={(value) => setNewLocationData({ ...newLocationData, type: value })}
                          disabled={locationCategories.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={locationCategories.length === 0 ? "No hay tipos configurados" : "Seleccionar tipo"} />
                          </SelectTrigger>
                          <SelectContent>
                            {locationCategories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {locationCategories.length === 0 && user?.role === 'admin' && (
                          <p className="text-xs text-muted-foreground">
                            Configura tipos de ubicación en la sección "Tipos de Ubicación" arriba
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location-floor">Piso/Ubicación</Label>
                        <Input
                          id="location-floor"
                          placeholder="Ej: Segundo piso, Aula 201"
                          value={newLocationData.floor}
                          onChange={(e) => setNewLocationData({ ...newLocationData, floor: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location-hours">Horarios</Label>
                        <Input
                          id="location-hours"
                          placeholder="Ej: 8:00 AM - 6:00 PM"
                          value={newLocationData.hours}
                          onChange={(e) => setNewLocationData({ ...newLocationData, hours: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location-description">Descripción</Label>
                      <Textarea
                        id="location-description"
                        placeholder="Describe esta ubicación..."
                        value={newLocationData.description}
                        onChange={(e) => setNewLocationData({ ...newLocationData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <IconSelector
                      value={newLocationData.icon as LocationIconName}
                      onChange={(iconName) => setNewLocationData({ ...newLocationData, icon: iconName })}
                      label="Icono de la ubicación"
                      required
                    />

                    {/* Sección de Imágenes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Imágenes de la ubicación (opcional)</Label>
                        <span className="text-xs text-muted-foreground">
                          {selectedImageFiles.length + newLocationData.images.length}/5
                        </span>
                      </div>

                      {/* Input oculto */}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      {/* Botón de agregar */}
                      {(selectedImageFiles.length + newLocationData.images.length) < 5 && (
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

                      {/* Preview de imágenes existentes (al editar) */}
                      {newLocationData.images.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Imágenes existentes:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {newLocationData.images.map((imageUrl, index) => (
                              <div key={index} className="relative group">
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

                      {/* Preview de imágenes nuevas */}
                      {selectedImageFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Nuevas imágenes:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedImageFiles.map((file, index) => (
                              <div key={index} className="relative group">
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
                        setSelectedCoordinates(null)
                        setEditingLocation(null)
                        setSelectedImageFiles([])
                        setNewLocationData({
                          name: "",
                          type: "",
                          description: "",
                          floor: "",
                          hours: "",
                          icon: "",
                          images: [],
                        })
                      }}
                      disabled={isSavingLocation}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveCustomLocation}
                      disabled={!newLocationData.name.trim() || !selectedCoordinates || !newLocationData.icon || isSavingLocation}
                    >
                      {isSavingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingLocation ? "Actualizar Ubicación" : "Guardar Ubicación"}
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
                            <div className="text-xs text-muted-foreground">
                              {location.floor}
                            </div>
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
            )}
          </CardContent>
        </Card>

        {/* Coupon Management Settings */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Gestión de Cupones
              </CardTitle>
              <CardDescription>Sube y gestiona los cupones disponibles para los estudiantes</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nuevo Cupón
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Cupón</DialogTitle>
                  <DialogDescription>Completa la información del cupón para agregarlo</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-image">Imagen del Cupón</Label>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
                      {newCoupon.image ? (
                        <div className="space-y-2">
                          <img
                            src={newCoupon.image || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-transparent"
                          >
                            Cambiar Imagen
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-24 flex flex-col items-center justify-center"
                        >
                          <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                          <span className="text-sm">Haz clic para subir imagen</span>
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-title">Título del Cupón *</Label>
                    <Input
                      id="coupon-title"
                      placeholder="Ej: Descuento en Comida"
                      value={newCoupon.title}
                      onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                      disabled={isSavingCoupon}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-description">Descripción (opcional)</Label>
                    <Textarea
                      id="coupon-description"
                      placeholder="Descripción del cupón"
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      disabled={isSavingCoupon}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-code">Código Promocional *</Label>
                    <Input
                      id="coupon-code"
                      placeholder="Ej: UNIAPP20"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      disabled={isSavingCoupon}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="coupon-discount-type">Tipo de Descuento *</Label>
                      <Select
                        value={newCoupon.discountType}
                        onValueChange={(value: "percentage" | "fixed_amount") => setNewCoupon({ ...newCoupon, discountType: value })}
                        disabled={isSavingCoupon}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                          <SelectItem value="fixed_amount">Monto Fijo ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coupon-discount">Valor *</Label>
                      <Input
                        id="coupon-discount"
                        type="number"
                        placeholder={newCoupon.discountType === 'percentage' ? '20' : '10'}
                        value={newCoupon.discount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                        disabled={isSavingCoupon}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-category">Aplicable a</Label>
                    <Select value={newCoupon.category} onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })} disabled={isSavingCoupon}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Productos y Tutorías</SelectItem>
                        <SelectItem value="products">Solo Productos</SelectItem>
                        <SelectItem value="tutoring">Solo Tutorías</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-expiry">Fecha de Vencimiento *</Label>
                    <Input
                      id="coupon-expiry"
                      type="date"
                      value={newCoupon.expiry}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                      disabled={isSavingCoupon}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCouponModalOpen(false)} disabled={isSavingCoupon}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveCoupon} disabled={isSavingCoupon}>
                    {isSavingCoupon ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cupón'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Display saved coupons */}
            {coupons.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-base font-medium">Cupones Guardados ({coupons.length})</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                    >
                      <img
                        src={coupon.image_url || "/placeholder.svg"}
                        alt={coupon.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{coupon.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{coupon.code}</p>
                          {!coupon.is_active && (
                            <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveCoupon(coupon.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay cupones guardados aún
              </p>
            )}
          </CardContent>
        </Card>
        )}

        {/* Tutoring Subjects Settings */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Materias de Tutorías
              </CardTitle>
              <CardDescription>Gestiona las materias disponibles para el sistema de tutorías</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleOpenSubjectDialog()}
                className="w-full"
                disabled={isLoadingSubjects}
              >
                {isLoadingSubjects ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Configurar materias de tutorías
                  </>
                )}
              </Button>

              {/* Tutoring Subjects Dialog */}
              <Dialog open={isTutoringSubjectsDialogOpen} onOpenChange={setIsTutoringSubjectsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSubject ? "Editar Materia" : "Gestionar Materias de Tutorías"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSubject
                        ? "Modifica la información de la materia"
                        : "Crea y administra las materias disponibles para tutorías"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Formulario de creación/edición */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-sm">
                        {editingSubject ? "Editar materia" : "Crear nueva materia"}
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject-name">Nombre *</Label>
                          <Input
                            id="subject-name"
                            placeholder="Ej: Cálculo Diferencial, Programación, Física..."
                            value={subjectFormData.name}
                            onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject-description">Descripción</Label>
                          <Textarea
                            id="subject-description"
                            placeholder="Describe esta materia..."
                            value={subjectFormData.description}
                            onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          {editingSubject && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setEditingSubject(null)
                                setSubjectFormData({ name: "", description: "" })
                              }}
                              disabled={isSavingSubject}
                            >
                              Cancelar edición
                            </Button>
                          )}
                          <Button
                            onClick={handleSaveSubject}
                            disabled={isSavingSubject || !subjectFormData.name.trim()}
                          >
                            {isSavingSubject ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {editingSubject ? "Actualizar" : "Crear"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Lista de materias existentes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          Materias existentes ({tutoringSubjects.length})
                        </Label>
                        {editingSubject && tutoringSubjects.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSubjectDialog()}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Nueva
                          </Button>
                        )}
                      </div>

                      {isLoadingSubjects ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : tutoringSubjects.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {tutoringSubjects.map((subject) => (
                            <div
                              key={subject.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${editingSubject?.id === subject.id
                                  ? "bg-primary/10 border-primary"
                                  : "bg-background border-border"
                                }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{subject.name}</p>
                                {subject.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {subject.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenSubjectDialog(subject)}
                                  className="h-8 w-8 p-0"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSubject(subject.id)}
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
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No hay materias configuradas</p>
                          <p className="text-xs mt-1">Crea tu primera materia arriba</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsTutoringSubjectsDialogOpen(false)
                        setEditingSubject(null)
                        setSubjectFormData({ name: "", description: "" })
                      }}
                    >
                      Cerrar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configura qué notificaciones deseas recibir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reports-notif">Reportes de seguridad</Label>
                <p className="text-sm text-muted-foreground">Alertas sobre incidentes reportados</p>
              </div>
              <Switch
                id="reports-notif"
                checked={notifications.reports}
                onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketplace-notif">Marketplace</Label>
                <p className="text-sm text-muted-foreground">Nuevos productos y mensajes de compra</p>
              </div>
              <Switch
                id="marketplace-notif"
                checked={notifications.marketplace}
                onCheckedChange={(checked) => setNotifications({ ...notifications, marketplace: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tutoring-notif">Tutorías</Label>
                <p className="text-sm text-muted-foreground">Solicitudes y confirmaciones de tutorías</p>
              </div>
              <Switch
                id="tutoring-notif"
                checked={notifications.tutoring}
                onCheckedChange={(checked) => setNotifications({ ...notifications, tutoring: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security-notif">Seguridad</Label>
                <p className="text-sm text-muted-foreground">Alertas de seguridad importantes</p>
              </div>
              <Switch
                id="security-notif"
                checked={notifications.security}
                onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacidad
            </CardTitle>
            <CardDescription>Controla la visibilidad de tu información</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visible">Perfil visible</Label>
                <p className="text-sm text-muted-foreground">Permite que otros estudiantes vean tu perfil</p>
              </div>
              <Switch
                id="profile-visible"
                checked={privacy.profileVisible}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-contact">Mostrar información de contacto</Label>
                <p className="text-sm text-muted-foreground">Permite que otros vean tu teléfono y email</p>
              </div>
              <Switch
                id="show-contact"
                checked={privacy.showContact}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, showContact: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-career">Mostrar carrera</Label>
                <p className="text-sm text-muted-foreground">Permite que otros vean tu carrera y semestre</p>
              </div>
              <Switch
                id="show-career"
                checked={privacy.showCareer}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, showCareer: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Configuración de la App
            </CardTitle>
            <CardDescription>Personaliza la apariencia y comportamiento de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Modo oscuro</Label>
                <p className="text-sm text-muted-foreground">Activa el tema oscuro de la aplicación</p>
              </div>
              <Switch
                id="dark-mode"
                checked={appSettings.darkMode}
                onCheckedChange={(checked) => setAppSettings({ ...appSettings, darkMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
            <CardDescription>Exporta o elimina tus datos de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportData} variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exportar mis datos
            </Button>
            <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar cuenta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de gestión de ubicaciones favoritas */}
      <FavoriteLocationsModal
        open={isFavoriteLocationsModalOpen}
        onOpenChange={setIsFavoriteLocationsModalOpen}
        onFavoritesChange={loadFavoriteLocations}
      />
    </AppLayout>
  )
}
