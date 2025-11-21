"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth"
import { Loader2, Plus, X } from "lucide-react"

interface CreateTutoringDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTutoringDialog({ open, onOpenChange }: CreateTutoringDialogProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subjects: [] as string[],
    newSubject: "",
    hourlyRate: "",
    location: "",
    description: "",
    experience: "",
    availability: [] as string[],
    languages: [] as string[],
  })

  const availabilityOptions = [
    "Lunes 8 AM-12 PM",
    "Lunes 1-5 PM",
    "Lunes 6-10 PM",
    "Martes 8 AM-12 PM",
    "Martes 1-5 PM",
    "Martes 6-10 PM",
    "Miércoles 8 AM-12 PM",
    "Miércoles 1-5 PM",
    "Miércoles 6-10 PM",
    "Jueves 8 AM-12 PM",
    "Jueves 1-5 PM",
    "Jueves 6-10 PM",
    "Viernes 8 AM-12 PM",
    "Viernes 1-5 PM",
    "Viernes 6-10 PM",
    "Sábados 8 AM-12 PM",
    "Sábados 1-5 PM",
    "Domingos 1-5 PM",
  ]

  const languageOptions = ["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Reset form and close dialog
    setFormData({
      subjects: [],
      newSubject: "",
      hourlyRate: "",
      location: "",
      description: "",
      experience: "",
      availability: [],
      languages: [],
    })
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSubject = () => {
    if (formData.newSubject.trim() && !formData.subjects.includes(formData.newSubject.trim())) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, prev.newSubject.trim()],
        newSubject: "",
      }))
    }
  }

  const removeSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }))
  }

  const toggleAvailability = (slot: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter((s) => s !== slot)
        : [...prev.availability, slot],
    }))
  }

  const toggleLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convertirse en Tutor</DialogTitle>
          <DialogDescription>Comparte tu conocimiento y ayuda a otros estudiantes</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subjects */}
          <div className="space-y-2">
            <Label>Materias que puedes enseñar</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Ej: Cálculo Diferencial"
                value={formData.newSubject}
                onChange={(e) => handleChange("newSubject", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSubject())}
              />
              <Button type="button" onClick={addSubject} disabled={!formData.newSubject.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                  >
                    <span>{subject}</span>
                    <button type="button" onClick={() => removeSubject(subject)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rate and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Tarifa por Hora (COP)</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="25000"
                value={formData.hourlyRate}
                onChange={(e) => handleChange("hourlyRate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación Preferida</Label>
              <Input
                id="location"
                placeholder="Biblioteca Central"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">Experiencia</Label>
            <Input
              id="experience"
              placeholder="Ej: 2 años enseñando matemáticas"
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Cuéntanos sobre tu experiencia, metodología de enseñanza y por qué eres un buen tutor..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Idiomas que hablas</Label>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={formData.languages.includes(language)}
                    onCheckedChange={() => toggleLanguage(language)}
                  />
                  <Label htmlFor={`lang-${language}`} className="text-sm">
                    {language}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label>Disponibilidad</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {availabilityOptions.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <Checkbox
                    id={`avail-${slot}`}
                    checked={formData.availability.includes(slot)}
                    onCheckedChange={() => toggleAvailability(slot)}
                  />
                  <Label htmlFor={`avail-${slot}`} className="text-sm">
                    {slot}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || formData.subjects.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Convertirse en Tutor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
