"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { getTutoringSubjects } from "@/services/tutoring-subjects.service"
import { useUpdateTutoringSession } from "@/hooks/useTutoringSessions"
import { parseAvailableHours, stringifyAvailableHours, toggleSlot } from "@/lib/availability-utils"
import type { AvailableHours, DayOfWeek, SlotRange, SessionMode, TutoringSessionWithTutor } from "@/types/tutoring.types"
import { ALL_DAYS, ALL_SLOTS, DAY_LABELS, SLOT_LABELS, MODE_LABELS } from "@/types/tutoring.types"
import type { Database } from "@/types/database.types"

type Category = Database['public']['Tables']['categories']['Row']

// Form validation schema
const editSessionSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres").max(1000),
  subject: z.string().min(2, "La materia es requerida"),
  category_id: z.string().optional(),
  price_per_hour: z.number().min(1000, "El precio mínimo es $1,000").max(500000, "El precio máximo es $500,000"),
  duration_minutes: z.number().min(30).max(480),
  mode: z.enum(["presential", "online", "both"]),
  location: z.string().optional(),
  meeting_url: z.string().url("URL inválida").optional().or(z.literal("")),
  max_students: z.number().min(1).max(50).optional(),
})

type EditSessionFormData = z.infer<typeof editSessionSchema>

interface EditTutoringDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: TutoringSessionWithTutor
  onSuccess?: () => void
}

export function EditTutoringDialog({ open, onOpenChange, session, onSuccess }: EditTutoringDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const updateSession = useUpdateTutoringSession()
  const [availableSubjects, setAvailableSubjects] = useState<Category[]>([])
  const [availableHours, setAvailableHours] = useState<AvailableHours>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditSessionFormData>({
    resolver: zodResolver(editSessionSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      category_id: undefined,
      price_per_hour: 25000,
      duration_minutes: 60,
      mode: "both",
      location: "",
      meeting_url: "",
      max_students: 1,
    },
  })

  const selectedMode = watch("mode")

  // Load categories
  useEffect(() => {
    getTutoringSubjects().then(setAvailableSubjects).catch(console.error)
  }, [])

  // Pre-load form data when dialog opens or session changes
  useEffect(() => {
    if (open && session) {
      reset({
        title: session.title,
        description: session.description,
        subject: session.subject,
        category_id: session.category_id || undefined,
        price_per_hour: session.price_per_hour,
        duration_minutes: session.duration_minutes,
        mode: session.mode as SessionMode,
        location: session.location || "",
        meeting_url: session.meeting_url || "",
        max_students: session.max_students || 1,
      })

      // Pre-load available hours
      setAvailableHours(parseAvailableHours(session.available_hours))
    }
  }, [open, session, reset])

  const handleToggleSlot = (day: DayOfWeek, slot: SlotRange) => {
    setAvailableHours(prev => toggleSlot(prev, day, slot))
  }

  const onSubmit = async (data: EditSessionFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para editar una sesión de tutoría",
        variant: "destructive",
      })
      return
    }

    // Check at least one availability slot is selected
    const hasAvailability = Object.values(availableHours).some(slots => slots && slots.length > 0)
    if (!hasAvailability) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un horario de disponibilidad",
        variant: "destructive",
      })
      return
    }

    // Validate location for presential/both modes
    if ((data.mode === "presential" || data.mode === "both") && !data.location) {
      toast({
        title: "Error",
        description: "Debes indicar una ubicación para las sesiones presenciales",
        variant: "destructive",
      })
      return
    }

    try {
      await updateSession.mutateAsync({
        id: session.id,
        data: {
          title: data.title,
          description: data.description,
          subject: data.subject,
          category_id: data.category_id || null,
          price_per_hour: data.price_per_hour,
          duration_minutes: data.duration_minutes,
          mode: data.mode,
          location: data.location || null,
          meeting_url: data.meeting_url || null,
          max_students: data.max_students || 1,
          available_hours: stringifyAvailableHours(availableHours),
        }
      })

      toast({
        title: "Sesión actualizada",
        description: "Los cambios han sido guardados exitosamente",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Sesión de Tutoría</DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu sesión de tutoría
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título de la sesión *</Label>
            <Input
              id="title"
              placeholder="Ej: Tutorías de Cálculo Diferencial"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Subject and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Materia *</Label>
              <Input
                id="subject"
                placeholder="Ej: Cálculo Diferencial"
                {...register("subject")}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={watch("category_id") || ""}
                onValueChange={(value) => setValue("category_id", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              placeholder="Describe tu experiencia, metodología de enseñanza, temas que cubres, nivel de estudiantes al que te diriges..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_per_hour">Precio por Hora (COP) *</Label>
              <Input
                id="price_per_hour"
                type="number"
                placeholder="25000"
                {...register("price_per_hour", { valueAsNumber: true })}
              />
              {errors.price_per_hour && (
                <p className="text-sm text-destructive">{errors.price_per_hour.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duración estándar (minutos)</Label>
              <Select
                value={watch("duration_minutes")?.toString() || "60"}
                onValueChange={(value) => setValue("duration_minutes", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1.5 horas</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label>Modalidad *</Label>
            <RadioGroup
              value={selectedMode}
              onValueChange={(value: string) => setValue("mode", value as SessionMode)}
              className="flex flex-wrap gap-4"
            >
              {(["presential", "online", "both"] as const).map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={`mode-${mode}`} />
                  <Label htmlFor={`mode-${mode}`} className="font-normal cursor-pointer">
                    {MODE_LABELS[mode]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Location (for presential/both) */}
          {(selectedMode === "presential" || selectedMode === "both") && (
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                placeholder="Ej: Biblioteca Central, Sala de estudio A"
                {...register("location")}
              />
            </div>
          )}

          {/* Meeting URL (for online/both) */}
          {(selectedMode === "online" || selectedMode === "both") && (
            <div className="space-y-2">
              <Label htmlFor="meeting_url">URL de reunión (opcional)</Label>
              <Input
                id="meeting_url"
                placeholder="https://meet.google.com/..."
                {...register("meeting_url")}
              />
              <p className="text-xs text-muted-foreground">
                Puedes agregar esto después o compartirlo directamente con los estudiantes
              </p>
            </div>
          )}

          {/* Availability Slots */}
          <div className="space-y-3">
            <Label>Disponibilidad Horaria *</Label>
            <p className="text-sm text-muted-foreground">
              Selecciona los bloques de 4 horas en los que estás disponible para dar tutorías
            </p>

            <div className="border rounded-lg p-4 space-y-4 max-h-64 overflow-y-auto">
              {ALL_DAYS.map((day) => (
                <div key={day} className="space-y-2">
                  <Label className="text-sm font-medium">{DAY_LABELS[day]}</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SLOTS.map((slot) => {
                      const isSelected = availableHours[day]?.includes(slot) || false
                      return (
                        <Button
                          key={`${day}-${slot}`}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleSlot(day, slot)}
                          className="text-xs"
                        >
                          {SLOT_LABELS[slot]}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Max Students */}
          <div className="space-y-2">
            <Label htmlFor="max_students">Máximo de estudiantes por sesión</Label>
            <Select
              value={watch("max_students")?.toString() || "1"}
              onValueChange={(value) => setValue("max_students", parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? "estudiante" : "estudiantes"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || updateSession.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateSession.isPending}
            >
              {(isSubmitting || updateSession.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
