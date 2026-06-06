import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, ImageIcon, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import {
  getPartnersByUniversity,
  getGlobalPartners,
  createPartner,
  updatePartner,
  deletePartner,
  uploadPartnerLogo,
} from '@/services/partners.service'
import type { Partner } from '@/services/partners.service'
import { getUniversities } from '@/services/universities.service'

// Valor centinela para "Sin universidad (global)" en el Select
const GLOBAL_VALUE = '__global__'

interface PartnerFormState {
  name: string
  logoUrl: string | null
  logoFile: File | null
  address: string
  notes: string
  universityId: string // '' representa global (university_id null)
}

const emptyForm: PartnerFormState = {
  name: '',
  logoUrl: null,
  logoFile: null,
  address: '',
  notes: '',
  universityId: '',
}

export function PartnersTab({ universityId }: { universityId: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [form, setForm] = useState<PartnerFormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const universityPartnersQuery = useQuery({
    queryKey: ['partners', universityId],
    queryFn: () => getPartnersByUniversity(universityId),
    enabled: !!universityId,
  })

  const globalPartnersQuery = useQuery({
    queryKey: ['partners-global'],
    queryFn: () => getGlobalPartners(),
  })

  const universitiesQuery = useQuery({
    queryKey: ['universities'],
    queryFn: () => getUniversities(),
  })

  const invalidatePartners = () => {
    queryClient.invalidateQueries({ queryKey: ['partners', universityId] })
    queryClient.invalidateQueries({ queryKey: ['partners-global'] })
  }

  const isEditingDefault = editingPartner?.is_default === true

  const openCreateDialog = () => {
    setEditingPartner(null)
    setForm({ ...emptyForm, universityId })
    setIsDialogOpen(true)
  }

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner)
    setForm({
      name: partner.name ?? '',
      logoUrl: partner.logo_url ?? null,
      logoFile: null,
      address: partner.address ?? '',
      notes: partner.notes ?? '',
      universityId: partner.university_id ?? '',
    })
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && isSaving) return
    setIsDialogOpen(open)
    if (!open) {
      setEditingPartner(null)
      setForm(emptyForm)
    }
  }

  // Cierre programático tras guardar: no depende del estado isSaving.
  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingPartner(null)
    setForm(emptyForm)
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logoUrl: URL.createObjectURL(file),
    }))
  }

  const createMutation = useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      invalidatePartners()
      toast({ title: 'Aliado creado', description: 'El aliado se guardó correctamente.' })
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof updatePartner>[1] }) =>
      updatePartner(id, values),
    onSuccess: () => {
      invalidatePartners()
      toast({ title: 'Aliado actualizado', description: 'Los cambios se guardaron correctamente.' })
      closeDialog()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      invalidatePartners()
      toast({ title: 'Aliado eliminado', description: 'El aliado se eliminó correctamente.' })
      setPartnerToDelete(null)
    },
  })

  const handleSubmit = async () => {
    const name = form.name.trim()
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Falta el nombre',
        description: 'El nombre del aliado es obligatorio.',
      })
      return
    }

    // Logo requerido al crear y al editar (salvo aliado is_default, que puede no tener logo)
    const needsLogo = !isEditingDefault && !form.logoFile && !form.logoUrl
    if (needsLogo) {
      toast({
        variant: 'destructive',
        title: 'Falta el logo',
        description: 'Debes subir un logo para el aliado.',
      })
      return
    }

    setIsSaving(true)
    try {
      let logoUrl = form.logoUrl
      if (form.logoFile) {
        logoUrl = await uploadPartnerLogo(form.logoFile, name)
      }

      const universityIdValue = form.universityId ? form.universityId : null
      const address = form.address.trim() || null
      const notes = form.notes.trim() || null

      if (editingPartner) {
        await updateMutation.mutateAsync({
          id: editingPartner.id,
          values: {
            name,
            logo_url: logoUrl,
            address,
            notes,
            university_id: universityIdValue,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name,
          logo_url: logoUrl,
          address,
          notes,
          university_id: universityIdValue,
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!partnerToDelete || partnerToDelete.is_default) return
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(partnerToDelete.id)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo eliminar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const universityPartners = universityPartnersQuery.data ?? []
  const globalPartners = globalPartnersQuery.data ?? []
  const universities = universitiesQuery.data ?? []

  const renderPartnerCard = (partner: Partner) => {
    const canDelete = !partner.is_default
    return (
      <Card key={partner.id} className="overflow-hidden">
        <CardContent className="flex items-center gap-3 p-3">
          {partner.logo_url ? (
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="h-12 w-12 shrink-0 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{partner.name}</p>
            {partner.is_default && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Predeterminado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title="Editar"
              onClick={() => openEditDialog(partner)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                title="Eliminar"
                onClick={() => setPartnerToDelete(partner)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Aliados</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los aliados comerciales de la universidad y los aliados globales.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo aliado
        </Button>
      </div>

      {/* Aliados de esta universidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" />
            Aliados de esta universidad
          </CardTitle>
          <CardDescription>
            Aliados visibles únicamente para esta universidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {universityPartnersQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando aliados...
            </div>
          ) : universityPartners.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {universityPartners.map(renderPartnerCard)}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No hay aliados para esta universidad</p>
              <p className="mt-1 text-xs">Crea tu primer aliado usando el botón de arriba.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aliados sin universidad asignada (globales) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" />
            Sin universidad asignada
          </CardTitle>
          <CardDescription>Se muestran en todas las universidades.</CardDescription>
        </CardHeader>
        <CardContent>
          {globalPartnersQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando aliados...
            </div>
          ) : globalPartners.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {globalPartners.map(renderPartnerCard)}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No hay aliados globales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPartner ? 'Editar aliado' : 'Nuevo aliado'}</DialogTitle>
            <DialogDescription>
              Completa la información del aliado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partner-logo">
                Logo{isEditingDefault ? ' (opcional)' : ' *'}
              </Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {form.logoUrl ? (
                  <div className="space-y-2">
                    <img
                      src={form.logoUrl}
                      alt="Vista previa"
                      className="mx-auto h-32 w-full rounded-lg object-contain"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar logo
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex h-24 w-full flex-col items-center justify-center"
                    disabled={isSaving}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
                    <span className="text-sm">Haz clic para subir el logo</span>
                  </Button>
                )}
                <input
                  id="partner-logo"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner-name">Nombre *</Label>
              <Input
                id="partner-name"
                placeholder="Ej: Cafetería Central"
                value={form.name}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner-address">Dirección (opcional)</Label>
              <Input
                id="partner-address"
                placeholder="Ej: Av. Principal 123"
                value={form.address}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner-notes">Notas (opcional)</Label>
              <Textarea
                id="partner-notes"
                placeholder="Información adicional del aliado"
                rows={3}
                value={form.notes}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner-university">Universidad</Label>
              <Select
                value={form.universityId === '' ? GLOBAL_VALUE : form.universityId}
                disabled={isSaving}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    universityId: value === GLOBAL_VALUE ? '' : value,
                  }))
                }
              >
                <SelectTrigger id="partner-university">
                  <SelectValue placeholder="Selecciona una universidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GLOBAL_VALUE}>Sin universidad (global)</SelectItem>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Un aliado sin universidad es global y se muestra en todas las universidades.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : editingPartner ? (
                'Guardar cambios'
              ) : (
                'Crear aliado'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog
        open={!!partnerToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPartnerToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar aliado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el aliado
              {partnerToDelete ? ` "${partnerToDelete.name}"` : ''} de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
