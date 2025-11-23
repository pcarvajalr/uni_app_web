import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AVAILABLE_LOCATION_ICONS,
  searchIcons,
  type LocationIconName,
} from '@/lib/icon-mapper'

interface IconSelectorProps {
  value?: LocationIconName | null
  onChange: (iconName: LocationIconName) => void
  label?: string
  required?: boolean
}

export function IconSelector({ value, onChange, label, required }: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrar iconos según búsqueda
  const filteredIcons = searchQuery
    ? searchIcons(searchQuery)
    : AVAILABLE_LOCATION_ICONS

  return (
    <div className="space-y-3">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar icono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid de iconos */}
      <div className="border rounded-lg p-3 max-h-80 overflow-y-auto">
        {filteredIcons.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No se encontraron iconos
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {filteredIcons.map((icon) => {
              const Icon = icon.component
              const isSelected = value === icon.name

              return (
                <Button
                  key={icon.name}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className="h-auto flex flex-col items-center gap-2 p-3 relative"
                  onClick={() => onChange(icon.name)}
                  title={icon.description}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <Icon className="h-6 w-6" />
                  <span className="text-xs text-center leading-tight">{icon.label}</span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1 py-0 h-4"
                  >
                    {icon.category === 'basic' ? 'Básico' : 'Servicio'}
                  </Badge>
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Icono seleccionado */}
      {value && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <div className="flex items-center gap-2 flex-1">
            {(() => {
              const selectedIcon = AVAILABLE_LOCATION_ICONS.find((i) => i.name === value)
              if (!selectedIcon) return null
              const Icon = selectedIcon.component
              return (
                <>
                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{selectedIcon.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedIcon.description}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
