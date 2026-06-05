import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Edit2, Loader2, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/types/database.types'
import {
  getTutoringSubjects,
  createTutoringSubject,
  updateTutoringSubject,
  deleteTutoringSubject,
  syncSubjectByName,
} from '@/services/tutoring-subjects.service'

type Category = Database['public']['Tables']['categories']['Row']

interface SubjectFormData {
  name: string
  description: string
  icon: string
}

const emptyForm: SubjectFormData = { name: '', description: '', icon: '' }

export function SubjectsTab({ universityId }: { universityId: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Category | null>(null)
  const [formData, setFormData] = useState<SubjectFormData>(emptyForm)
  const [subjectToDelete, setSubjectToDelete] = useState<Category | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const {
    data: subjects = [],
    isLoading,
  } = useQuery({
    queryKey: ['tutoring-subjects', universityId],
    queryFn: () => getTutoringSubjects(universityId),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['tutoring-subjects', universityId] })

  const openCreateDialog = () => {
    setEditingSubject(null)
    setFormData(emptyForm)
    setIsFormOpen(true)
  }

  const openEditDialog = (subject: Category) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      description: subject.description ?? '',
      icon: subject.icon ?? '',
    })
    setIsFormOpen(true)
  }

  const closeDialog = () => {
    setIsFormOpen(false)
    setEditingSubject(null)
    setFormData(emptyForm)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const name = formData.name.trim()
      const description = formData.description.trim() || null
      const icon = formData.icon.trim() || null

      if (editingSubject) {
        return updateTutoringSubject(editingSubject.id, { name, description, icon })
      }
      return createTutoringSubject({ name, description, icon, university_id: universityId })
    },
    onSuccess: async () => {
      await invalidate()
      toast({
        title: editingSubject ? 'Materia actualizada' : 'Materia creada',
        description: editingSubject
          ? 'La materia se ha actualizado correctamente'
          : 'La nueva materia se ha creado correctamente',
      })
      closeDialog()
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la materia',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTutoringSubject(id),
    onSuccess: async () => {
      await invalidate()
      toast({
        title: 'Materia eliminada',
        description: 'La materia se ha eliminado correctamente',
      })
      setSubjectToDelete(null)
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la materia',
        variant: 'destructive',
      })
      setSubjectToDelete(null)
    },
  })

  const syncMutation = useMutation({
    mutationFn: (id: string) => syncSubjectByName(id),
    onMutate: (id: string) => {
      setSyncingId(id)
    },
    onSuccess: async (created: number) => {
      await invalidate()
      toast({
        title: 'Sincronización completada',
        description: `Sincronizada en ${created} universidad${created === 1 ? '' : 'es'}`,
      })
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo sincronizar la materia',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setSyncingId(null)
    },
  })

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'El nombre de la materia es obligatorio',
        variant: 'destructive',
      })
      return
    }
    saveMutation.mutate()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Materias de Tutorías
          </CardTitle>
          <CardDescription>
            Gestiona las materias disponibles para el sistema de tutorías de esta universidad
          </CardDescription>
        </div>
        <Button onClick={openCreateDialog} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva materia
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : subjects.length > 0 ? (
          <div className="space-y-2">
            {subjects.map((subject) => {
              const isSyncing = syncMutation.isPending && syncingId === subject.id
              return (
                <div
                  key={subject.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {subject.icon && (
                        <span className="text-base leading-none" aria-hidden>
                          {subject.icon}
                        </span>
                      )}
                      <p className="font-medium text-sm truncate">{subject.name}</p>
                    </div>
                    {subject.description && (
                      <p className="text-xs text-muted-foreground mt-1">{subject.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => syncMutation.mutate(subject.id)}
                      disabled={isSyncing}
                      className="h-8 w-8 p-0"
                      title="Sincronizar a otras universidades"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(subject)}
                      className="h-8 w-8 p-0"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSubjectToDelete(subject)}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm font-medium">No hay materias configuradas</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Crea la primera materia para esta universidad
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva materia
            </Button>
          </div>
        )}
      </CardContent>

      {/* Create / Edit dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
          else setIsFormOpen(true)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
            <DialogDescription>
              {editingSubject
                ? 'Modifica la información de la materia'
                : 'Crea una nueva materia para el sistema de tutorías'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Nombre *</Label>
              <Input
                id="subject-name"
                placeholder="Ej: Cálculo Diferencial, Programación, Física..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-description">Descripción</Label>
              <Input
                id="subject-description"
                placeholder="Describe brevemente esta materia (opcional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-icon">Ícono</Label>
              <Input
                id="subject-icon"
                placeholder="Ej: 📐 o el nombre de un ícono (opcional)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saveMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !formData.name.trim()}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingSubject ? 'Actualizar' : 'Crear'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={subjectToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSubjectToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta materia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La materia
              {subjectToDelete ? ` "${subjectToDelete.name}"` : ''} se eliminará de forma
              permanente. Si está siendo utilizada por tutorías existentes, no podrás eliminarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (subjectToDelete) deleteMutation.mutate(subjectToDelete.id)
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
