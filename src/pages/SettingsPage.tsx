import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { MapPin, Shield, Download, Trash2, X, Settings } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  getUserFavoriteLocations,
  toggleLocationFavorite,
} from "@/services/location-favorites.service"
import { usePrivacySettings, useUpdatePrivacySetting, useUpdateShowContactSetting } from "@/hooks/useUserProfile"
import type { Database } from "@/types/database.types"
import { FavoriteLocationsModal } from "@/components/FavoriteLocationsModal"

type CampusLocation = Database['public']['Tables']['campus_locations']['Row']

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [favoriteLocations, setFavoriteLocations] = useState<CampusLocation[]>([])
  const [isFavoriteLocationsModalOpen, setIsFavoriteLocationsModalOpen] = useState(false)

  // Privacy settings with server persistence
  const { data: serverPrivacySettings, isLoading: isLoadingPrivacy } = usePrivacySettings(user?.id || "", !!user?.id)
  const updatePrivacy = useUpdatePrivacySetting()
  const updateShowContact = useUpdateShowContactSetting()

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showContact: false,
  })

  // Sync privacy state with server data
  useEffect(() => {
    if (serverPrivacySettings) {
      setPrivacy({
        profileVisible: serverPrivacySettings.is_profile_public,
        showContact: serverPrivacySettings.show_contact_info,
      })
    }
  }, [serverPrivacySettings])

  // Handler to update profile visibility and persist to server
  const handleProfileVisibleChange = async (checked: boolean) => {
    setPrivacy(prev => ({ ...prev, profileVisible: checked }))
    if (user?.id) {
      try {
        await updatePrivacy.mutateAsync({ userId: user.id, isPublic: checked })
        toast({
          title: "Configuración guardada",
          description: "Tu configuración de privacidad ha sido actualizada",
        })
      } catch {
        // Revert on error
        setPrivacy(prev => ({ ...prev, profileVisible: !checked }))
        toast({
          title: "Error",
          description: "No se pudo actualizar la configuración",
          variant: "destructive",
        })
      }
    }
  }

  // Handler to update show contact setting and persist to server
  const handleShowContactChange = async (checked: boolean) => {
    setPrivacy(prev => ({ ...prev, showContact: checked }))
    if (user?.id) {
      try {
        await updateShowContact.mutateAsync({ userId: user.id, showContact: checked })
        toast({
          title: "Configuración actualizada",
          description: "Tu preferencia de contacto ha sido guardada",
        })
      } catch {
        // Revert on error
        setPrivacy(prev => ({ ...prev, showContact: !checked }))
        toast({
          title: "Error",
          description: "No se pudo actualizar la configuración",
          variant: "destructive",
        })
      }
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
    loadFavoriteLocations()
  }, [])

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
    // Navigate to the account deletion page
    navigate("/account-deletion")
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu experiencia </p>
        </div>

        {/* Admin access */}
        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Administración</CardTitle>
              <CardDescription>Maestros del sistema multi-universidad</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => navigate('/admin/universities')}>Universidades</Button>
              <Button variant="outline" onClick={() => navigate('/admin/config')}>Configuración de universidades</Button>
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
                onCheckedChange={handleProfileVisibleChange}
                disabled={isLoadingPrivacy || updatePrivacy.isPending}
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
                onCheckedChange={handleShowContactChange}
                disabled={isLoadingPrivacy || updateShowContact.isPending}
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
