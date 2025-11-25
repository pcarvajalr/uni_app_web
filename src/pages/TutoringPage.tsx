import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Filter, Star, Clock, MapPin, BookOpen, Users, X } from "lucide-react"
import { useState } from "react"
import { CreateTutoringDialog } from "@/components/tutoring/create-tutoring-dialog"
import { TutoringDetailsDialog } from "@/components/tutoring/tutoring-details-dialog"

interface Tutor {
  id: string
  name: string
  studentId: string
  subjects: string[]
  rating: number
  reviewCount: number
  hourlyRate: number
  availability: string[]
  location: string
  description: string
  experience: string
  languages: string[]
  avatar?: string
}

export default function TutoringPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(100000)
  const [selectedRating, setSelectedRating] = useState<string | null>(null)

  const mockTutors: Tutor[] = [
    {
      id: "1",
      name: "Ana García",
      studentId: "2022001",
      subjects: ["Cálculo Diferencial", "Cálculo Integral", "Álgebra Lineal"],
      rating: 4.9,
      reviewCount: 24,
      hourlyRate: 25000,
      availability: ["Lunes 2-6 PM", "Miércoles 10 AM-2 PM", "Viernes 3-7 PM"],
      location: "Biblioteca Central",
      description:
        "Estudiante de Ingeniería Matemática con 3 años de experiencia en tutorías. Me especializo en hacer que las matemáticas sean comprensibles y divertidas.",
      experience: "3 años",
      languages: ["Español", "Inglés"],
    },
    {
      id: "2",
      name: "Carlos Ruiz",
      studentId: "2021045",
      subjects: ["Java", "Python", "Estructuras de Datos", "Algoritmos"],
      rating: 4.8,
      reviewCount: 18,
      hourlyRate: 30000,
      availability: ["Martes 1-5 PM", "Jueves 9 AM-1 PM", "Sábados 10 AM-4 PM"],
      location: "Laboratorio de Sistemas",
      description:
        "Desarrollador de software con experiencia en múltiples lenguajes. Ayudo a estudiantes a dominar la programación desde lo básico hasta proyectos avanzados.",
      experience: "2 años",
      languages: ["Español", "Inglés"],
    },
    {
      id: "3",
      name: "María López",
      studentId: "2023078",
      subjects: ["Física I", "Física II", "Mecánica", "Termodinámica"],
      rating: 4.7,
      reviewCount: 15,
      hourlyRate: 28000,
      availability: ["Lunes 10 AM-2 PM", "Miércoles 3-7 PM"],
      location: "Laboratorio de Física",
      description:
        "Estudiante de Física con pasión por la enseñanza. Utilizo experimentos y ejemplos prácticos para explicar conceptos complejos.",
      experience: "2 años",
      languages: ["Español"],
    },
    {
      id: "4",
      name: "Diego Morales",
      studentId: "2022156",
      subjects: ["Inglés Conversacional", "TOEFL Prep", "Business English"],
      rating: 4.9,
      reviewCount: 31,
      hourlyRate: 35000,
      availability: ["Todos los días 6-10 PM"],
      location: "Centro de Idiomas",
      description:
        "Certificado en enseñanza de inglés con experiencia internacional. Ayudo a estudiantes a mejorar su fluidez y prepararse para exámenes.",
      experience: "4 años",
      languages: ["Español", "Inglés", "Francés"],
    },
  ]

  const filteredTutors = mockTutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some((subject) => subject.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSubject =
      !selectedSubject ||
      tutor.subjects.some((subject) => subject.toLowerCase().includes(selectedSubject.toLowerCase()))
    const matchesPrice = tutor.hourlyRate >= minPrice && tutor.hourlyRate <= maxPrice
    const matchesRating = !selectedRating || tutor.rating >= Number(selectedRating)
    return matchesSearch && matchesSubject && matchesPrice && matchesRating
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Tutorías</h1>
            <p className="text-muted-foreground">Encuentra tutores o ofrece tus servicios</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ser Tutor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">23</div>
              <p className="text-sm text-muted-foreground">Tutores Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <p className="text-sm text-muted-foreground">Sesiones Completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">4.8</div>
              <p className="text-sm text-muted-foreground">Rating Promedio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <p className="text-sm text-muted-foreground">Materias Disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar tutores o materias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="font-medium mb-3 text-sm">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Subject Filter */}
              <div className="space-y-2">                
                <select
                  value={selectedSubject || ""}
                  onChange={(e) => setSelectedSubject(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Todas las Materias</option>
                  <option value="matematicas">Matemáticas</option>
                  <option value="fisica">Física</option>
                  <option value="quimica">Química</option>
                  <option value="programacion">Programación</option>
                  <option value="ingles">Inglés</option>
                  <option value="economia">Economía</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <select
                  value={selectedRating || ""}
                  onChange={(e) => setSelectedRating(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Puntaje del tutor</option>
                  <option value="4.5">4.5+ Estrellas</option>
                  <option value="4.0">4.0+ Estrellas</option>
                  <option value="3.5">3.5+ Estrellas</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Precio por Hora</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full text-sm"
                  />
                  <span className="text-muted-foreground text-sm">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            </div>

            {(selectedSubject || selectedRating || minPrice > 0 || maxPrice < 100000) && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {selectedSubject && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedSubject}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSubject(null)} />
                  </Badge>
                )}
                {selectedRating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedRating}+ estrellas
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedRating(null)} />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSubject(null)
                    setSelectedRating(null)
                    setMinPrice(0)
                    setMaxPrice(100000)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tutors List */}
        <div className="space-y-4">
          {filteredTutors.map((tutor) => (
            <Card
              key={tutor.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTutor(tutor)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(tutor.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{tutor.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span className="text-sm font-medium">{tutor.rating}</span>
                        <span className="text-sm text-muted-foreground">({tutor.reviewCount} reseñas)</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tutor.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {tutor.subjects.slice(0, 3).map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tutor.subjects.length - 3} más
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tutor.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {tutor.experience} experiencia
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {tutor.languages.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-1">{formatPrice(tutor.hourlyRate)}</div>
                    <p className="text-sm text-muted-foreground mb-3">por hora</p>
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Reservar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron tutores</h3>
                <p>Intenta cambiar los filtros de búsqueda o explora otras materias</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Materias Más Populares</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedSubject("matematicas")}
              >
                <div className="text-2xl font-bold text-primary">8</div>
                <p className="text-sm font-medium">Matemáticas</p>
                <p className="text-xs text-muted-foreground">tutores disponibles</p>
              </div>
              <div
                className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedSubject("fisica")}
              >
                <div className="text-2xl font-bold text-primary">6</div>
                <p className="text-sm font-medium">Física</p>
                <p className="text-xs text-muted-foreground">tutores disponibles</p>
              </div>
              <div
                className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedSubject("quimica")}
              >
                <div className="text-2xl font-bold text-primary">4</div>
                <p className="text-sm font-medium">Química</p>
                <p className="text-xs text-muted-foreground">tutores disponibles</p>
              </div>
              <div
                className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedSubject("programacion")}
              >
                <div className="text-2xl font-bold text-primary">5</div>
                <p className="text-sm font-medium">Programación</p>
                <p className="text-xs text-muted-foreground">tutores disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateTutoringDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <TutoringDetailsDialog
        tutor={selectedTutor}
        open={!!selectedTutor}
        onOpenChange={(open) => !open && setSelectedTutor(null)}
      />
    </AppLayout>
  )
}
