import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { User, Save } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    studentId: user?.studentId || "",
    career: user?.career || "",
    semester: user?.semester || "",
    phone: user?.phone || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async () => {
    setIsLoading(true)

    try {
      await updateProfile({
        full_name: profileData.name,
        email: profileData.email,
        student_id: profileData.studentId,
        career: profileData.career,
        semester: profileData.semester ? Number(profileData.semester) : null,
        phone: profileData.phone,
      })

      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      })
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y datos académicos</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>Actualiza tu información de perfil y datos académicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">ID Estudiante</Label>
                <Input
                  id="studentId"
                  value={profileData.studentId}
                  onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">Carrera</Label>
                <Input
                  id="career"
                  value={profileData.career}
                  onChange={(e) => setProfileData({ ...profileData, career: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre</Label>
                <Input
                  id="semester"
                  value={profileData.semester}
                  onChange={(e) => setProfileData({ ...profileData, semester: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="w-full" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
