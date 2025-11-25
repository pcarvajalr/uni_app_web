import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Shield,
  ShoppingBag,
  GraduationCap,
  User,
  Settings,
  BookOpen,
  Navigation,
  Bell,
  Lock,
  Smartphone,
  FileText,
} from "lucide-react"
import { getMapImageUrl } from "@/services/campus-settings.service"
// Image removed

export default function HelpPage() {
  const [mapImageUrl, setMapImageUrl] = useState("/university-campus-map-layout-with-buildings-and-pa.jpg")

  const loadMapImageUrl = async () => {
    try {
      const url = await getMapImageUrl()
      setMapImageUrl(url)
    } catch (error) {
      console.error('Error cargando URL de la imagen del mapa:', error)
    }
  }

  useEffect(() => {
    loadMapImageUrl()
  }, [])

  const downloadWord = () => {
    // Dynamic import to avoid SSR issues
    import("docx")
      .then(({ Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun }) => {
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                // Header
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "UniApp - Guía Completa de Funcionalidades",
                      bold: true,
                      size: 32,
                      color: "DC2626",
                    }),
                  ],
                  heading: HeadingLevel.TITLE,
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Aplicación móvil para estudiantes universitarios",
                      italics: true,
                      size: 20,
                      color: "6B7280",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: "" }), // Espacio

                // Consejos Rápidos
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Consejos Rápidos",
                      bold: true,
                      size: 24,
                      color: "DC2626",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Diseño Móvil: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Optimizada para dispositivos móviles con navegación intuitiva",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Autenticación: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Inicia sesión para acceder a todas las funcionalidades",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Notificaciones: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Mantente al día con alertas sobre reportes, ventas y tutorías",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Seguridad: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Información protegida con medidas de seguridad avanzadas",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }), // Espacio

                // Funcionalidades Principales
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Funcionalidades Principales",
                      bold: true,
                      size: 24,
                      color: "DC2626",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                }),

                // Mapas y Ubicación
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "1. Mapas y Ubicación",
                      bold: true,
                      size: 20,
                      color: "3B82F6",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Lugares Cercanos: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Busca servicios cerca de la universidad usando Google Maps con búsqueda por categorías y resultados en tiempo real.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Mapa del Campus: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Explora el campus con marcadores interactivos, información detallada y horarios de edificios.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ubicaciones Personalizadas: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Crea ubicaciones favoritas con selección visual en el mapa y categorización personalizada.",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                // Reportes de Seguridad
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "2. Reportes de Seguridad",
                      bold: true,
                      size: 20,
                      color: "EF4444",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Reportar Incidentes: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Reporta robos con formulario detallado, ubicación específica y nivel de urgencia.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ver Reportes: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Consulta reportes de la comunidad con filtros por tipo y detalles completos.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Alertas de Seguridad: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Notificaciones en tiempo real y mapeo de incidentes.",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                // Marketplace
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "3. Marketplace Estudiantil",
                      bold: true,
                      size: 20,
                      color: "10B981",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Vender Productos: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Publica productos con fotos, descripción detallada y precio personalizable.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Comprar Productos: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Explora productos con búsqueda, filtros y contacto directo con vendedores.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Gestión de Ventas: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Administra productos, historial de ventas y comunicación con compradores.",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                // Tutorías
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "4. Sistema de Tutorías",
                      bold: true,
                      size: 20,
                      color: "8B5CF6",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ofrecer Tutorías: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Comparte conocimiento con materias especializadas, precio por hora y modalidad presencial/virtual.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Buscar Tutores: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Encuentra ayuda académica con búsqueda por materia y comparación de precios.",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Gestión de Sesiones: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Organiza tutorías con calendario, evaluaciones y gestión de pagos.",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "5. Configuraciones y Personalización",
                      bold: true,
                      size: 20,
                      color: "F97316",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Perfil Personal:",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Información Personal: Nombre completo, email, teléfono",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Información Académica: Carrera, semestre, universidad",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Foto de Perfil: Sube y actualiza tu imagen de perfil",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Configuración de Notificaciones:",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Reportes de Seguridad: Alertas de nuevos incidentes",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Marketplace: Notificaciones de ventas y mensajes",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Tutorías: Recordatorios de sesiones y nuevas solicitudes",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Configuración General: Activar/desactivar por tipo",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ubicaciones Favoritas:",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Crear Ubicaciones: Selecciona puntos en el mapa del campus",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Gestionar Ubicaciones: Edita, elimina y organiza tus lugares favoritos",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Categorización: Asigna tipos (Aula, Laboratorio, Cafetería, etc.)",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Información Detallada: Agrega descripción, piso y horarios",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Configuración de Privacidad:",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Visibilidad del Perfil: Controla quién puede ver tu información",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Información de Contacto: Gestiona la visibilidad de email y teléfono",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Historial de Actividad: Controla el registro de tus acciones",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Personalización de la App:",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Tema: Modo claro/oscuro automático o manual",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Idioma: Español e inglés disponibles",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Tamaño de Fuente: Ajusta para mejor legibilidad",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Gestión de Datos:",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Exportar Datos: Descarga tu información personal",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Limpiar Caché: Libera espacio de almacenamiento",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "  • Eliminar Cuenta: Proceso seguro de eliminación de datos",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                // Guía de Navegación
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Guía de Navegación",
                      bold: true,
                      size: 24,
                      color: "DC2626",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Menú Principal: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Accede a todas las secciones desde el menú hamburguesa",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Navegación Rápida: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Usa botones de acción rápida en cada sección",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Búsqueda: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Utiliza barras de búsqueda para encontrar contenido específico",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Configuraciones: ",
                      bold: true,
                    }),
                    new TextRun({
                      text: "Personaliza desde el ícono de configuración",
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                // Soporte Técnico
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Soporte Técnico",
                      bold: true,
                      size: 20,
                      color: "DC2626",
                    }),
                  ],
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Email: soporte@uniapp.edu",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "WhatsApp: +57 300 123 4567",
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({ text: "" }),

                // Footer
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "UniApp - Aplicación móvil universitaria",
                      italics: true,
                      size: 18,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
                      size: 16,
                      color: "6B7280",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            },
          ],
        })

        // Generate and download the Word document
        Packer.toBlob(doc).then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "UniApp-Guia-Completa-Funcionalidades.docx"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        })
      })
      .catch((error) => {
        console.error("Error loading docx:", error)
        alert("Error al generar el documento Word. Por favor, intenta nuevamente.")
      })
  }

  const features = [
    {
      category: "Mapas y Ubicación",
      icon: MapPin,
      color: "bg-blue-500",
      items: [
        {
          title: "Lugares Cercanos",
          description: "Busca restaurantes, bancos, farmacias y más cerca de la universidad usando Google Maps",
          features: ["Búsqueda por categorías", "Integración con Google Maps", "Resultados en tiempo real"],
        },
        {
          title: "Mapa del Campus",
          description: "Explora el campus universitario con un mapa interactivo",
          features: [
            "Marcadores interactivos",
            "Información detallada de ubicaciones",
            "Horarios y pisos de edificios",
          ],
        },
        {
          title: "Ubicaciones Personalizadas",
          description: "Crea y gestiona tus propias ubicaciones favoritas en el campus",
          features: ["Selección visual en el mapa", "Categorización personalizada", "Gestión desde configuraciones"],
        },
      ],
    },
    {
      category: "Reportes de Seguridad",
      icon: Shield,
      color: "bg-red-500",
      items: [
        {
          title: "Reportar Incidentes",
          description: "Reporta robos y otros incidentes de seguridad en el campus",
          features: ["Formulario detallado", "Ubicación específica", "Nivel de urgencia", "Descripción completa"],
        },
        {
          title: "Ver Reportes",
          description: "Consulta todos los reportes de la comunidad universitaria",
          features: ["Lista actualizada", "Filtros por tipo", "Detalles completos", "Estado del reporte"],
        },
        {
          title: "Alertas de Seguridad",
          description: "Mantente informado sobre la seguridad en el campus",
          features: ["Notificaciones en tiempo real", "Mapeo de incidentes", "Estadísticas de seguridad"],
        },
      ],
    },
    {
      category: "Marketplace Estudiantil",
      icon: ShoppingBag,
      color: "bg-green-500",
      items: [
        {
          title: "Vender Productos",
          description: "Publica productos para vender a otros estudiantes",
          features: ["Fotos del producto", "Descripción detallada", "Precio personalizable", "Información de contacto"],
        },
        {
          title: "Comprar Productos",
          description: "Explora productos disponibles de otros estudiantes",
          features: ["Búsqueda y filtros", "Categorías organizadas", "Contacto directo", "Detalles del vendedor"],
        },
        {
          title: "Gestión de Ventas",
          description: "Administra tus productos y transacciones",
          features: [
            "Estado de productos",
            "Historial de ventas",
            "Edición de publicaciones",
            "Comunicación con compradores",
          ],
        },
      ],
    },
    {
      category: "Sistema de Tutorías",
      icon: GraduationCap,
      color: "bg-purple-500",
      items: [
        {
          title: "Ofrecer Tutorías",
          description: "Comparte tu conocimiento y gana dinero enseñando",
          features: [
            "Materias especializadas",
            "Precio por hora",
            "Horarios disponibles",
            "Modalidad (presencial/virtual)",
          ],
        },
        {
          title: "Buscar Tutores",
          description: "Encuentra ayuda académica de otros estudiantes",
          features: ["Búsqueda por materia", "Comparar precios", "Ver disponibilidad", "Contacto directo"],
        },
        {
          title: "Gestión de Sesiones",
          description: "Organiza y administra tus tutorías",
          features: ["Calendario de sesiones", "Historial académico", "Evaluaciones", "Pagos y facturación"],
        },
      ],
    },
    {
      category: "Configuraciones y Perfil",
      icon: Settings,
      color: "bg-orange-500",
      items: [
        {
          title: "Perfil Personal",
          description: "Gestiona tu información personal y académica",
          features: ["Datos personales", "Información académica", "Foto de perfil", "Información de contacto"],
        },
        {
          title: "Notificaciones",
          description: "Controla qué notificaciones recibes",
          features: ["Reportes de seguridad", "Marketplace", "Tutorías", "Configuración por tipo"],
        },
        {
          title: "Privacidad",
          description: "Controla la visibilidad de tu información",
          features: [
            "Perfil público/privado",
            "Información de contacto",
            "Historial de actividad",
            "Configuración de datos",
          ],
        },
      ],
    },
  ]

  const quickTips = [
    {
      icon: Smartphone,
      title: "Diseño Móvil",
      description: "La app está optimizada para dispositivos móviles con navegación intuitiva",
    },
    {
      icon: User,
      title: "Autenticación",
      description: "Inicia sesión para acceder a todas las funcionalidades de la aplicación",
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Mantente al día con alertas sobre reportes, ventas y tutorías",
    },
    {
      icon: Lock,
      title: "Seguridad",
      description: "Toda tu información está protegida con medidas de seguridad avanzadas",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">Centro de Ayuda</h1>
          <p className="text-muted-foreground text-lg">Descubre todas las funcionalidades de UniApp</p>
          {/* <div className="pt-4">
            <Button onClick={downloadWord} className="gap-2">
              <FileText className="h-4 w-4" />
              Descargar Guía Word
            </Button>
          </div> */}
        </div>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Consejos Rápidos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTips.map((tip, index) => {
                const Icon = tip.icon
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Mapa Interactivo del Campus</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                El mapa del campus te permite explorar todas las ubicaciones de manera visual e interactiva. Haz clic en
                cualquier ubicación para ver información detallada y crear tus propias ubicaciones personalizadas.
              </p>
              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                <img
                  src={mapImageUrl}
                  alt="Mapa interactivo del campus universitario"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Mapa Interactivo</p>
                    <p className="text-xs text-muted-foreground">Haz clic en las ubicaciones para más información</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <Badge variant="secondary">Marcadores interactivos</Badge>
                <Badge variant="secondary">Información detallada</Badge>
                <Badge variant="secondary">Ubicaciones personalizadas</Badge>
                <Badge variant="secondary">Navegación visual</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Funcionalidades Principales</h2>

          {features.map((category, categoryIndex) => {
            const CategoryIcon = category.icon
            return (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <span>{category.category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{item.title}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {itemIndex < category.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Navigation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5" />
              <span>Guía de Navegación</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Menú Principal</h4>
                <p className="text-sm text-muted-foreground">
                  Accede a todas las secciones desde el menú hamburguesa en la parte superior
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Navegación Rápida</h4>
                <p className="text-sm text-muted-foreground">
                  Usa los botones de acción rápida en cada sección para funciones principales
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Búsqueda</h4>
                <p className="text-sm text-muted-foreground">
                  Utiliza las barras de búsqueda para encontrar contenido específico rápidamente
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Configuraciones</h4>
                <p className="text-sm text-muted-foreground">
                  Personaliza tu experiencia desde el ícono de configuración en el header
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">¿Necesitas más ayuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Si tienes preguntas adicionales o encuentras algún problema, no dudes en contactar al soporte técnico.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge variant="outline" className="w-fit">
                Email: 
              </Badge>
              <Badge variant="outline" className="w-fit">
                WhatsApp: 
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
