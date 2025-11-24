import type { LucideIcon } from 'lucide-react'
import {
  Building,
  BookOpen,
  Coffee,
  Car,
  GraduationCap,
  Beaker,
  Users,
  Dumbbell,
  Heart,
  Utensils,
  Briefcase,
  Wifi,
  Printer,
  Computer,
  Music,
  MapPin,
} from 'lucide-react'

/**
 * Tipo que representa los iconos disponibles para ubicaciones del campus
 */
export type LocationIconName =
  | 'building'
  | 'book-open'
  | 'coffee'
  | 'car'
  | 'graduation-cap'
  | 'beaker'
  | 'users'
  | 'dumbbell'
  | 'heart'
  | 'utensils'
  | 'briefcase'
  | 'wifi'
  | 'printer'
  | 'computer'
  | 'music'
  | 'map-pin'

/**
 * Definición de un icono con su metadatos
 */
export interface LocationIconDefinition {
  name: LocationIconName
  component: LucideIcon
  label: string
  description: string
  category: 'basic' | 'services'
}

/**
 * Mapeo de nombres de iconos a componentes de Lucide React
 */
export const LOCATION_ICON_MAP: Record<LocationIconName, LucideIcon> = {
  'building': Building,
  'book-open': BookOpen,
  'coffee': Coffee,
  'car': Car,
  'graduation-cap': GraduationCap,
  'beaker': Beaker,
  'users': Users,
  'dumbbell': Dumbbell,
  'heart': Heart,
  'utensils': Utensils,
  'briefcase': Briefcase,
  'wifi': Wifi,
  'printer': Printer,
  'computer': Computer,
  'music': Music,
  'map-pin': MapPin,
}

/**
 * Lista completa de iconos disponibles con metadatos
 */
export const AVAILABLE_LOCATION_ICONS: LocationIconDefinition[] = [
  // Set Básico Universitario
  {
    name: 'building',
    component: Building,
    label: 'Edificio',
    description: 'Edificios y estructuras generales',
    category: 'basic',
  },
  {
    name: 'book-open',
    component: BookOpen,
    label: 'Biblioteca',
    description: 'Bibliotecas y salas de lectura',
    category: 'basic',
  },
  {
    name: 'coffee',
    component: Coffee,
    label: 'Cafetería',
    description: 'Cafeterías y áreas de snacks',
    category: 'basic',
  },
  {
    name: 'car',
    component: Car,
    label: 'Estacionamiento',
    description: 'Estacionamientos y parqueaderos',
    category: 'basic',
  },
  {
    name: 'graduation-cap',
    component: GraduationCap,
    label: 'Académico',
    description: 'Áreas académicas y aulas',
    category: 'basic',
  },
  {
    name: 'beaker',
    component: Beaker,
    label: 'Laboratorio',
    description: 'Laboratorios y espacios experimentales',
    category: 'basic',
  },
  {
    name: 'users',
    component: Users,
    label: 'Áreas Sociales',
    description: 'Espacios de convivencia y socialización',
    category: 'basic',
  },
  {
    name: 'dumbbell',
    component: Dumbbell,
    label: 'Gimnasio',
    description: 'Gimnasios y áreas deportivas',
    category: 'basic',
  },
  // Set Extendido de Servicios
  {
    name: 'heart',
    component: Heart,
    label: 'Enfermería',
    description: 'Servicios médicos y enfermería',
    category: 'services',
  },
  {
    name: 'utensils',
    component: Utensils,
    label: 'Comedor',
    description: 'Comedores y áreas de alimentación',
    category: 'services',
  },
  {
    name: 'briefcase',
    component: Briefcase,
    label: 'Oficinas',
    description: 'Oficinas administrativas',
    category: 'services',
  },
  {
    name: 'wifi',
    component: Wifi,
    label: 'Zona Tech',
    description: 'Zonas WiFi y tecnología',
    category: 'services',
  },
  {
    name: 'printer',
    component: Printer,
    label: 'Impresión',
    description: 'Servicios de impresión y copiado',
    category: 'services',
  },
  {
    name: 'computer',
    component: Computer,
    label: 'Sala de Cómputo',
    description: 'Salas de computadoras',
    category: 'services',
  },
  {
    name: 'music',
    component: Music,
    label: 'Auditorio',
    description: 'Auditorios y espacios culturales',
    category: 'services',
  },
  {
    name: 'map-pin',
    component: MapPin,
    label: 'Ubicación',
    description: 'Marcador general de ubicación',
    category: 'basic',
  },
]

/**
 * Obtiene el componente de icono a partir de su nombre
 * @param iconName - Nombre del icono
 * @returns Componente de Lucide React o MapPin por defecto
 */
export const getIconComponent = (iconName?: string | null): LucideIcon => {
  if (!iconName) return MapPin

  const icon = LOCATION_ICON_MAP[iconName as LocationIconName]
  return icon || MapPin
}

/**
 * Obtiene la definición completa de un icono por su nombre
 * @param iconName - Nombre del icono
 * @returns Definición del icono o undefined si no existe
 */
export const getIconDefinition = (
  iconName: string
): LocationIconDefinition | undefined => {
  return AVAILABLE_LOCATION_ICONS.find((icon) => icon.name === iconName)
}

/**
 * Filtra iconos por categoría
 * @param category - Categoría a filtrar ('basic' | 'services')
 * @returns Array de iconos de la categoría especificada
 */
export const getIconsByCategory = (
  category: 'basic' | 'services'
): LocationIconDefinition[] => {
  return AVAILABLE_LOCATION_ICONS.filter((icon) => icon.category === category)
}

/**
 * Busca iconos por nombre o descripción
 * @param query - Texto de búsqueda
 * @returns Array de iconos que coinciden con la búsqueda
 */
export const searchIcons = (query: string): LocationIconDefinition[] => {
  const lowerQuery = query.toLowerCase()
  return AVAILABLE_LOCATION_ICONS.filter(
    (icon) =>
      icon.label.toLowerCase().includes(lowerQuery) ||
      icon.description.toLowerCase().includes(lowerQuery)
  )
}
