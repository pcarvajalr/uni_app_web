import { useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Loader2, Pencil, Plus, Ticket, Trash2 } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

import {
  getAllCouponsWithPartner,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  uploadCouponImage,
} from '@/services/coupons.service'
import type { AdminCouponWithPartner } from '@/services/coupons.service'
import { getPartnersByUniversity, getGlobalPartners } from '@/services/partners.service'
import type { Partner } from '@/services/partners.service'

type DiscountType = 'percentage' | 'fixed_amount'
type ApplicableTo = 'products' | 'tutoring' | 'both'

interface CouponFormState {
  code: string
  title: string
  description: string
  discountType: DiscountType
  discountValue: string
  imageUrl: string | null
  imageFile: File | null
  validUntil: string // yyyy-mm-dd
  applicableTo: ApplicableTo
  isActive: boolean
  partnerId: string // '' = sin seleccionar
}

const emptyForm: CouponFormState = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  imageUrl: null,
  imageFile: null,
  validUntil: '',
  applicableTo: 'both',
  isActive: true,
  partnerId: '',
}

const applicableLabels: Record<ApplicableTo, string> = {
  products: 'Productos',
  tutoring: 'Tutorías',
  both: 'Ambos',
}

const formatDiscount = (type: string, value: number): string =>
  type === 'percentage' ? `${value}% OFF` : `$${value} OFF`

const formatDate = (value: string | null): string => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// yyyy-mm-dd para el input date a partir de un timestamp ISO
const toDateInputValue = (value: string | null): string => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function CouponsTab({ universityId }: { universityId: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCouponWithPartner | null>(null)
  const [form, setForm] = useState<CouponFormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<AdminCouponWithPartner | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reassigningId, setReassigningId] = useState<string | null>(null)

  const couponsQuery = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => getAllCouponsWithPartner(),
  })

  const universityPartnersQuery = useQuery({
    queryKey: ['partners', universityId],
    queryFn: () => getPartnersByUniversity(universityId),
    enabled: !!universityId,
  })

  const globalPartnersQuery = useQuery({
    queryKey: ['partners-global'],
    queryFn: () => getGlobalPartners(),
  })

  const invalidateCoupons = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })

  const coupons = couponsQuery.data ?? []
  const universityPartners = useMemo(
    () => universityPartnersQuery.data ?? [],
    [universityPartnersQuery.data],
  )
  const globalPartners = useMemo(
    () => globalPartnersQuery.data ?? [],
    [globalPartnersQuery.data],
  )

  // Lista combinada de aliados seleccionables (universidad + globales)
  const partnerOptions = useMemo<{ partner: Partner; isGlobal: boolean }[]>(() => {
    return [
      ...universityPartners.map((partner) => ({ partner, isGlobal: false })),
      ...globalPartners.map((partner) => ({ partner, isGlobal: true })),
    ]
  }, [universityPartners, globalPartners])

  const universityCoupons = useMemo(
    () => coupons.filter((coupon) => coupon.partner?.university_id === universityId),
    [coupons, universityId],
  )
  const globalCoupons = useMemo(
    () => coupons.filter((coupon) => (coupon.partner?.university_id ?? null) === null),
    [coupons],
  )

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      invalidateCoupons()
      toast({ title: 'Cupón creado', description: 'El cupón se guardó correctamente.' })
      closeDialog()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Parameters<typeof updateCoupon>[1] }) =>
      updateCoupon(id, values),
    onSuccess: () => {
      invalidateCoupons()
      toast({ title: 'Cupón actualizado', description: 'Los cambios se guardaron correctamente.' })
      closeDialog()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      invalidateCoupons()
      toast({ title: 'Cupón eliminado', description: 'El cupón se eliminó correctamente.' })
      setCouponToDelete(null)
    },
  })

  const reassignMutation = useMutation({
    mutationFn: ({ id, partnerId }: { id: string; partnerId: string }) =>
      updateCoupon(id, { partner_id: partnerId }),
    onSuccess: () => {
      invalidateCoupons()
      toast({
        title: 'Aliado reasignado',
        description: 'El cupón se asignó al nuevo aliado.',
      })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'No se pudo reasignar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      })
    },
    onSettled: () => setReassigningId(null),
  })

  const openCreateDialog = () => {
    setEditingCoupon(null)
    setForm(emptyForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = (coupon: AdminCouponWithPartner) => {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code ?? '',
      title: coupon.title ?? '',
      description: coupon.description ?? '',
      discountType: (coupon.discount_type as DiscountType) ?? 'percentage',
      discountValue: coupon.discount_value != null ? String(coupon.discount_value) : '',
      imageUrl: coupon.image_url ?? null,
      imageFile: null,
      validUntil: toDateInputValue(coupon.valid_until),
      applicableTo: (coupon.applicable_to as ApplicableTo) ?? 'both',
      isActive: coupon.is_active ?? true,
      partnerId: coupon.partner?.id ?? '',
    })
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && isSaving) return
    setIsDialogOpen(open)
    if (!open) {
      setEditingCoupon(null)
      setForm(emptyForm)
    }
  }

  // Cierre programático tras guardar: no depende del estado isSaving.
  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingCoupon(null)
    setForm(emptyForm)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }))
  }

  const handleSubmit = async () => {
    const code = form.code.trim().toUpperCase()
    const title = form.title.trim()
    const discountValue = parseFloat(form.discountValue)

    if (!title) {
      toast({ variant: 'destructive', title: 'Falta el título', description: 'El título es obligatorio.' })
      return
    }
    if (!code) {
      toast({ variant: 'destructive', title: 'Falta el código', description: 'El código promocional es obligatorio.' })
      return
    }
    if (Number.isNaN(discountValue) || discountValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Descuento inválido',
        description: 'El valor del descuento debe ser un número mayor a 0.',
      })
      return
    }
    if (!form.validUntil) {
      toast({ variant: 'destructive', title: 'Falta la fecha', description: 'Indica la fecha de vencimiento.' })
      return
    }
    if (!form.partnerId) {
      toast({ variant: 'destructive', title: 'Falta el aliado', description: 'Debes seleccionar un aliado para el cupón.' })
      return
    }
    // Imagen requerida al crear; al editar puede conservarse la existente
    if (!editingCoupon && !form.imageFile && !form.imageUrl) {
      toast({ variant: 'destructive', title: 'Falta la imagen', description: 'Debes subir una imagen para el cupón.' })
      return
    }

    setIsSaving(true)
    try {
      let imageUrl = form.imageFile ? null : form.imageUrl
      if (form.imageFile) {
        imageUrl = await uploadCouponImage(form.imageFile, code)
      }

      const validUntilIso = new Date(`${form.validUntil}T23:59:59`).toISOString()
      const description = form.description.trim() || null

      if (editingCoupon) {
        await updateMutation.mutateAsync({
          id: editingCoupon.id,
          values: {
            code,
            title,
            description,
            discount_type: form.discountType,
            discount_value: discountValue,
            image_url: imageUrl,
            valid_until: validUntilIso,
            applicable_to: form.applicableTo,
            is_active: form.isActive,
            partner_id: form.partnerId,
          },
        })
      } else {
        await createMutation.mutateAsync({
          code,
          title,
          description,
          discount_type: form.discountType,
          discount_value: discountValue,
          image_url: imageUrl,
          valid_from: new Date().toISOString(),
          valid_until: validUntilIso,
          applicable_to: form.applicableTo,
          is_active: form.isActive,
          partner_id: form.partnerId,
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
    if (!couponToDelete) return
    setIsDeleting(true)
    try {
      await deleteMutation.mutateAsync(couponToDelete.id)
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

  const handleReassign = (coupon: AdminCouponWithPartner, partnerId: string) => {
    if (!partnerId || partnerId === coupon.partner?.id) return
    setReassigningId(coupon.id)
    reassignMutation.mutate({ id: coupon.id, partnerId })
  }

  const renderCouponCard = (coupon: AdminCouponWithPartner) => {
    const isReassigning = reassigningId === coupon.id
    return (
      <Card key={coupon.id} className="overflow-hidden">
        <CardContent className="space-y-3 p-3">
          <div className="flex items-start gap-3">
            <img
              src={coupon.image_url || '/placeholder.svg'}
              alt={coupon.title}
              className="h-14 w-14 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{coupon.title}</p>
              <p className="font-mono text-xs text-muted-foreground">{coupon.code}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {formatDiscount(coupon.discount_type, coupon.discount_value)}
                </Badge>
                {coupon.applicable_to && (
                  <Badge variant="outline">
                    {applicableLabels[coupon.applicable_to as ApplicableTo] ?? coupon.applicable_to}
                  </Badge>
                )}
                {!coupon.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Editar"
                onClick={() => openEditDialog(coupon)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                title="Eliminar"
                onClick={() => setCouponToDelete(coupon)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Válido hasta: <span className="font-medium">{formatDate(coupon.valid_until)}</span>
          </p>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Aliado</Label>
            <Select
              value={coupon.partner?.id ?? ''}
              disabled={isReassigning || partnerOptions.length === 0}
              onValueChange={(value) => handleReassign(coupon, value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecciona un aliado">
                  {isReassigning ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Reasignando...
                    </span>
                  ) : (
                    coupon.partner?.name ?? 'Sin aliado'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {partnerOptions.map(({ partner, isGlobal }) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                    {isGlobal ? ' (global)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Cupones</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los cupones de la universidad. Cada cupón pertenece a un aliado.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo cupón
        </Button>
      </div>

      <p className="rounded-md border border-muted bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Reasignar a un aliado de otra universidad cambia dónde se ve el cupón; a un aliado global lo
        hace visible en todas.
      </p>

      {/* Cupones de esta universidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-5 w-5" />
            Cupones de esta universidad
          </CardTitle>
          <CardDescription>
            Cupones de aliados que pertenecen a esta universidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {couponsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando cupones...
            </div>
          ) : universityCoupons.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {universityCoupons.map(renderCouponCard)}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Ticket className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No hay cupones para esta universidad</p>
              <p className="mt-1 text-xs">Crea tu primer cupón usando el botón de arriba.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cupones sin universidad asignada (globales) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-5 w-5" />
            Sin universidad asignada
          </CardTitle>
          <CardDescription>Se muestran en todas las universidades.</CardDescription>
        </CardHeader>
        <CardContent>
          {couponsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando cupones...
            </div>
          ) : globalCoupons.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {globalCoupons.map(renderCouponCard)}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Ticket className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No hay cupones globales</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Editar cupón' : 'Nuevo cupón'}</DialogTitle>
            <DialogDescription>Completa la información del cupón.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-image">Imagen{editingCoupon ? ' (opcional)' : ' *'}</Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-center">
                {form.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={form.imageUrl}
                      alt="Vista previa"
                      className="mx-auto h-32 w-full rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar imagen
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
                    <span className="text-sm">Haz clic para subir imagen</span>
                  </Button>
                )}
                <input
                  id="coupon-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-partner">Aliado *</Label>
              <Select
                value={form.partnerId}
                disabled={isSaving || partnerOptions.length === 0}
                onValueChange={(value) => setForm((prev) => ({ ...prev, partnerId: value }))}
              >
                <SelectTrigger id="coupon-partner">
                  <SelectValue placeholder="Selecciona un aliado" />
                </SelectTrigger>
                <SelectContent>
                  {partnerOptions.map(({ partner, isGlobal }) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                      {isGlobal ? ' (global)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-title">Título *</Label>
              <Input
                id="coupon-title"
                placeholder="Ej: Descuento en comida"
                value={form.title}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-description">Descripción (opcional)</Label>
              <Textarea
                id="coupon-description"
                placeholder="Descripción del cupón"
                rows={2}
                value={form.description}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-code">Código promocional *</Label>
              <Input
                id="coupon-code"
                placeholder="Ej: UNIAPP20"
                value={form.code}
                disabled={isSaving}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="coupon-discount-type">Tipo de descuento *</Label>
                <Select
                  value={form.discountType}
                  disabled={isSaving}
                  onValueChange={(value: DiscountType) =>
                    setForm((prev) => ({ ...prev, discountType: value }))
                  }
                >
                  <SelectTrigger id="coupon-discount-type">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                    <SelectItem value="fixed_amount">Monto fijo ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-discount-value">Valor *</Label>
                <Input
                  id="coupon-discount-value"
                  type="number"
                  min="0"
                  placeholder={form.discountType === 'percentage' ? '20' : '10'}
                  value={form.discountValue}
                  disabled={isSaving}
                  onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-applicable">Aplicable a *</Label>
              <Select
                value={form.applicableTo}
                disabled={isSaving}
                onValueChange={(value: ApplicableTo) =>
                  setForm((prev) => ({ ...prev, applicableTo: value }))
                }
              >
                <SelectTrigger id="coupon-applicable">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Productos</SelectItem>
                  <SelectItem value="tutoring">Tutorías</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-valid-until">Fecha de vencimiento *</Label>
              <Input
                id="coupon-valid-until"
                type="date"
                value={form.validUntil}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="coupon-active">Cupón activo</Label>
                <p className="text-xs text-muted-foreground">
                  Solo los cupones activos se muestran a los estudiantes.
                </p>
              </div>
              <Switch
                id="coupon-active"
                checked={form.isActive}
                disabled={isSaving}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
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
              ) : editingCoupon ? (
                'Guardar cambios'
              ) : (
                'Crear cupón'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog
        open={!!couponToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setCouponToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cupón?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el cupón
              {couponToDelete ? ` "${couponToDelete.title}"` : ''} de forma permanente.
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
