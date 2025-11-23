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
import { Bell, MapPin, Shield, Palette, Download, Trash2, Save, Plus, X, Map, Ticket, Upload, ImageIcon, Settings, Edit2, Loader2, Info } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  getLocationCategories,
  createLocationCategory,
  updateLocationCategory,
  deleteLocationCategory,
} from "@/services/location-categories.service"
import type { Database } from "@/types/database.types"

type Category = Database['public']['Tables']['categories']['Row']
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

  const [coupons, setCoupons] = useState<any[]>([])
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    title: "",
    discount: "",
    code: "",
    expiry: "",
    category: "",
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

  const [favoriteLocations, setFavoriteLocations] = useState(["Biblioteca Central", "Cafetería Principal"])
  const [newLocation, setNewLocation] = useState("")
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ x: number; y: number } | null>(null)
  const [newLocationData, setNewLocationData] = useState({
    name: "",
    type: "",
    description: "",
    floor: "",
    hours: "",
  })

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

  // Load coupons on component mount
  useEffect(() => {
    const stored = localStorage.getItem("uniapp_coupons")
    if (stored) {
      setCoupons(JSON.parse(stored))
    }
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

  useEffect(() => {
    loadLocationCategories()
  }, [])

  // ... existing handlers ...

  const handleAddFavoriteLocation = () => {
    if (newLocation.trim()) {
      setFavoriteLocations([...favoriteLocations, newLocation.trim()])
      setNewLocation("")
      toast({
        title: "Ubicación agregada",
        description: "La ubicación ha sido añadida a tus favoritos.",
      })
    }
  }

  const handleRemoveFavoriteLocation = (location: string) => {
    setFavoriteLocations(favoriteLocations.filter((loc) => loc !== location))
    toast({
      title: "Ubicación eliminada",
      description: "La ubicación ha sido removida de tus favoritos.",
    })
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
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setSelectedCoordinates({ x, y })
  }

  const handleSaveCustomLocation = () => {
    if (newLocationData.name.trim() && selectedCoordinates) {
      setFavoriteLocations([...favoriteLocations, newLocationData.name])

      setNewLocationData({
        name: "",
        type: "",
        description: "",
        floor: "",
        hours: "",
      })
      setSelectedCoordinates(null)
      setIsLocationModalOpen(false)

      toast({
        title: "Ubicación personalizada creada",
        description: "La nueva ubicación ha sido agregada exitosamente.",
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCoupon({ ...newCoupon, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCoupon = () => {
    if (
      newCoupon.title.trim() &&
      newCoupon.discount.trim() &&
      newCoupon.code.trim() &&
      newCoupon.expiry.trim() &&
      newCoupon.category.trim() &&
      newCoupon.image
    ) {
      const couponToSave = {
        id: Date.now().toString(),
        ...newCoupon,
      }

      const updatedCoupons = [...coupons, couponToSave]
      setCoupons(updatedCoupons)
      localStorage.setItem("uniapp_coupons", JSON.stringify(updatedCoupons))

      setNewCoupon({
        title: "",
        discount: "",
        code: "",
        expiry: "",
        category: "",
        image: "",
      })
      setIsCouponModalOpen(false)

      toast({
        title: "Cupón agregado",
        description: "El cupón ha sido guardado exitosamente.",
      })
    } else {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCoupon = (couponId: string) => {
    const updatedCoupons = coupons.filter((c) => c.id !== couponId)
    setCoupons(updatedCoupons)
    localStorage.setItem("uniapp_coupons", JSON.stringify(updatedCoupons))
    toast({
      title: "Cupón eliminado",
      description: "El cupón ha sido removido.",
    })
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
              <Label>Ubicaciones favoritas</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {favoriteLocations.map((location, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {location}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleRemoveFavoriteLocation(location)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar nueva ubicación favorita"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFavoriteLocation()}
              />
              <Button onClick={handleAddFavoriteLocation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
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
                    <DialogTitle>Crear ubicación del Campus</DialogTitle>
                    <DialogDescription>
                      Haz clic en el mapa para seleccionar las coordenadas de tu nueva ubicación
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Seleccionar ubicación en el mapa</Label>
                      <div
                        className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden cursor-crosshair border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                        onClick={handleMapClick}
                      >
                        <img
                          src="/university-campus-map-layout-with-buildings-and-pa.jpg"
                          alt="Mapa del Campus Universitario"
                          className="w-full h-full object-cover"
                        />

                        {selectedCoordinates && (
                          <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                            style={{
                              left: `${selectedCoordinates.x}%`,
                              top: `${selectedCoordinates.y}%`,
                            }}
                          >
                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                          </div>
                        )}

                        {!selectedCoordinates && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
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
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsLocationModalOpen(false)
                        setSelectedCoordinates(null)
                        setNewLocationData({
                          name: "",
                          type: "",
                          description: "",
                          floor: "",
                          hours: "",
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveCustomLocation}
                      disabled={!newLocationData.name.trim() || !selectedCoordinates}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Ubicación
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    <Label htmlFor="coupon-title">Título del Cupón</Label>
                    <Input
                      id="coupon-title"
                      placeholder="Ej: Descuento en Comida"
                      value={newCoupon.title}
                      onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-discount">Descuento</Label>
                    <Input
                      id="coupon-discount"
                      placeholder="Ej: 20% OFF"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-code">Código Promocional</Label>
                    <Input
                      id="coupon-code"
                      placeholder="Ej: UNIAPP20"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-category">Categoría</Label>
                    <Select value={newCoupon.category} onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alimentos">Alimentos</SelectItem>
                        <SelectItem value="Tecnología">Tecnología</SelectItem>
                        <SelectItem value="Ropa">Ropa</SelectItem>
                        <SelectItem value="Libros">Libros</SelectItem>
                        <SelectItem value="Servicios">Servicios</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-expiry">Fecha de Vencimiento</Label>
                    <Input
                      id="coupon-expiry"
                      placeholder="Ej: 31 Dic 2024"
                      value={newCoupon.expiry}
                      onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCouponModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveCoupon}>Guardar Cupón</Button>
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
                        src={coupon.image || "/placeholder.svg"}
                        alt={coupon.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{coupon.title}</p>
                        <p className="text-xs text-muted-foreground">{coupon.code}</p>
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

        {/* ... existing cards ... */}

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
    </AppLayout>
  )
}
