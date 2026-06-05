import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Building2, Plus, Pencil, Trash2, Globe, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getUniversityDomains,
  addUniversityDomain,
  removeUniversityDomain,
  getUniversityDataCounts,
} from "@/services/universities.service"
import type { UniversityDataCounts } from "@/services/universities.service"
import type { Database } from "@/types/database.types"

type University = Database["public"]["Tables"]["universities"]["Row"]
type UniversityDomain = Database["public"]["Tables"]["university_domains"]["Row"]

const UNIVERSITIES_KEY = ["universities"] as const

// Devuelve el mensaje legible de un error desconocido
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Ocurrió un error inesperado. Inténtalo de nuevo."
}

// Construye el desglose legible de los datos asociados a una universidad
const buildCountsBreakdown = (counts: UniversityDataCounts): string => {
  const parts: string[] = []
  const push = (count: number, singular: string, plural: string) => {
    if (count > 0) parts.push(`${count} ${count === 1 ? singular : plural}`)
  }
  push(counts.users_count, "usuario", "usuarios")
  push(counts.partners_count, "aliado", "aliados")
  push(counts.coupons_count, "cupón", "cupones")
  push(counts.products_count, "producto", "productos")
  push(counts.sessions_count, "tutoría", "tutorías")
  push(counts.locations_count, "ubicación", "ubicaciones")
  return parts.join(", ")
}

const totalCounts = (counts: UniversityDataCounts): number =>
  counts.users_count +
  counts.partners_count +
  counts.coupons_count +
  counts.products_count +
  counts.sessions_count +
  counts.locations_count

export default function AdminUniversitiesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: universities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: UNIVERSITIES_KEY,
    queryFn: getUniversities,
  })

  // Estado de los diálogos
  const [formOpen, setFormOpen] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)
  const [formValues, setFormValues] = useState({ name: "", city: "", address: "" })

  const [domainsUniversity, setDomainsUniversity] = useState<University | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<University | null>(null)
  const [deleteCounts, setDeleteCounts] = useState<UniversityDataCounts | null>(null)
  const [checkingCounts, setCheckingCounts] = useState(false)

  const invalidateUniversities = () =>
    queryClient.invalidateQueries({ queryKey: UNIVERSITIES_KEY })

  // ============================================
  // Crear / Editar universidad
  // ============================================

  const openCreate = () => {
    setEditingUniversity(null)
    setFormValues({ name: "", city: "", address: "" })
    setFormOpen(true)
  }

  const openEdit = (university: University) => {
    setEditingUniversity(university)
    setFormValues({
      name: university.name ?? "",
      city: university.city ?? "",
      address: university.address ?? "",
    })
    setFormOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formValues.name.trim(),
        city: formValues.city.trim() || null,
        address: formValues.address.trim() || null,
      }
      if (editingUniversity) {
        return updateUniversity(editingUniversity.id, payload)
      }
      return createUniversity(payload)
    },
    onSuccess: async () => {
      await invalidateUniversities()
      toast({
        title: editingUniversity ? "Universidad actualizada" : "Universidad creada",
        description: editingUniversity
          ? "Los cambios se guardaron correctamente."
          : "La universidad se creó correctamente.",
      })
      setFormOpen(false)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  const handleSubmitForm = (event: React.FormEvent) => {
    event.preventDefault()
    if (!formValues.name.trim()) {
      toast({
        title: "Campo requerido",
        description: "Debes indicar el nombre de la universidad.",
        variant: "destructive",
      })
      return
    }
    saveMutation.mutate()
  }

  // ============================================
  // Eliminar universidad
  // ============================================

  const handleRequestDelete = async (university: University) => {
    setDeleteTarget(university)
    setDeleteCounts(null)
    setCheckingCounts(true)
    try {
      const counts = await getUniversityDataCounts(university.id)
      setDeleteCounts(counts)
    } catch (error) {
      setDeleteTarget(null)
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setCheckingCounts(false)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (universityId: string) => deleteUniversity(universityId),
    onSuccess: async () => {
      await invalidateUniversities()
      toast({
        title: "Universidad eliminada",
        description: "La universidad se eliminó correctamente.",
      })
      setDeleteTarget(null)
      setDeleteCounts(null)
    },
    onError: (error) => {
      toast({
        title: "No se pudo eliminar",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) return
    setDeleteTarget(null)
    setDeleteCounts(null)
  }

  const hasBlockingData = deleteCounts ? totalCounts(deleteCounts) > 0 : false

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Universidades</h1>
            </div>
            <p className="text-muted-foreground">
              Administra las universidades, sus dominios de correo y sus datos.
            </p>
          </div>
          <Button onClick={openCreate} className="sm:self-start">
            <Plus className="h-4 w-4 mr-2" />
            Nueva universidad
          </Button>
        </div>

        {/* Listado */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de universidades</CardTitle>
            <CardDescription>
              Consulta y gestiona todas las universidades registradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Cargando universidades...
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-destructive">
                No se pudieron cargar las universidades. Inténtalo de nuevo.
              </div>
            ) : universities.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No hay universidades registradas
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crea la primera universidad para empezar.
                </p>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva universidad
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-3 px-2 font-medium">Nombre</th>
                      <th className="py-3 px-2 font-medium">Ciudad</th>
                      <th className="py-3 px-2 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities.map((university) => (
                      <tr key={university.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-3 px-2 font-medium text-foreground">
                          {university.name}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {university.city || "—"}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(university)}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDomainsUniversity(university)}
                            >
                              <Globe className="h-3.5 w-3.5 mr-1" />
                              Dominios
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRequestDelete(university)}
                              disabled={checkingCounts && deleteTarget?.id === university.id}
                            >
                              {checkingCounts && deleteTarget?.id === university.id ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                              )}
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo Crear / Editar */}
      <Dialog open={formOpen} onOpenChange={(open) => !saveMutation.isPending && setFormOpen(open)}>
        <DialogContent>
          <form onSubmit={handleSubmitForm}>
            <DialogHeader>
              <DialogTitle>
                {editingUniversity ? "Editar universidad" : "Nueva universidad"}
              </DialogTitle>
              <DialogDescription>
                {editingUniversity
                  ? "Modifica los datos de la universidad."
                  : "Completa los datos para crear una nueva universidad."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="university-name">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="university-name"
                  value={formValues.name}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Universidad Nacional"
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="university-city">Ciudad</Label>
                <Input
                  id="university-city"
                  value={formValues.city}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, city: event.target.value }))
                  }
                  placeholder="Ciudad (opcional)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="university-address">Dirección</Label>
                <Input
                  id="university-address"
                  value={formValues.address}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, address: event.target.value }))
                  }
                  placeholder="Dirección (opcional)"
                />
              </div>

              {!editingUniversity && (
                <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span>
                    Al crear la universidad se agregan automáticamente las materias por defecto.
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saveMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingUniversity ? "Guardar cambios" : "Crear universidad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Dominios */}
      <DomainsDialog
        university={domainsUniversity}
        onClose={() => setDomainsUniversity(null)}
      />

      {/* Diálogo de Eliminación */}
      <AlertDialog
        open={!!deleteTarget && !!deleteCounts}
        onOpenChange={(open) => !open && closeDeleteDialog()}
      >
        <AlertDialogContent>
          {deleteCounts && hasBlockingData ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>No se puede eliminar</AlertDialogTitle>
                <AlertDialogDescription>
                  La universidad <span className="font-medium">{deleteTarget?.name}</span> tiene
                  datos asociados y no se puede eliminar: {buildCountsBreakdown(deleteCounts)}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="outline" onClick={closeDeleteDialog}>
                  Cerrar
                </Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar universidad?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la universidad{" "}
                  <span className="font-medium">{deleteTarget?.name}</span>. Esta acción no se
                  puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                  onClick={(event) => {
                    event.preventDefault()
                    if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
                  }}
                >
                  {deleteMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

// ============================================
// Diálogo de gestión de dominios
// ============================================

interface DomainsDialogProps {
  university: University | null
  onClose: () => void
}

function DomainsDialog({ university, onClose }: DomainsDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [newDomain, setNewDomain] = useState("")

  const universityId = university?.id ?? null

  const {
    data: domains = [],
    isLoading,
  } = useQuery({
    queryKey: ["university-domains", universityId],
    queryFn: () => getUniversityDomains(universityId as string),
    enabled: !!universityId,
  })

  const invalidateDomains = () =>
    queryClient.invalidateQueries({ queryKey: ["university-domains", universityId] })

  const addMutation = useMutation({
    mutationFn: (domain: string) => addUniversityDomain(universityId as string, domain),
    onSuccess: async () => {
      await invalidateDomains()
      setNewDomain("")
      toast({ title: "Dominio agregado", description: "El dominio se agregó correctamente." })
    },
    onError: (error) => {
      toast({
        title: "No se pudo agregar el dominio",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (domainId: string) => removeUniversityDomain(domainId),
    onSuccess: async () => {
      await invalidateDomains()
      toast({ title: "Dominio eliminado", description: "El dominio se eliminó correctamente." })
    },
    onError: (error) => {
      toast({
        title: "No se pudo eliminar el dominio",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  const handleAddDomain = (event: React.FormEvent) => {
    event.preventDefault()
    const value = newDomain.trim()
    if (!value) return
    addMutation.mutate(value)
  }

  const isBusy = addMutation.isPending || removeMutation.isPending

  return (
    <Dialog open={!!university} onOpenChange={(open) => !open && !isBusy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dominios de {university?.name}</DialogTitle>
          <DialogDescription>
            Gestiona los dominios de correo permitidos para registrarse en esta universidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Advertencia sin dominios */}
          {!isLoading && domains.length === 0 && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Debe tener al menos un dominio para que los usuarios se registren.
              </span>
            </div>
          )}

          {/* Listado de dominios */}
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando dominios...
            </div>
          ) : domains.length > 0 ? (
            <ul className="space-y-2">
              {domains.map((domain: UniversityDomain) => (
                <li
                  key={domain.id}
                  className="flex items-center justify-between gap-2 rounded-md border p-2"
                >
                  <Badge variant="secondary" className="font-mono">
                    @{domain.domain}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeMutation.mutate(domain.id)}
                    disabled={isBusy}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar dominio</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Agregar dominio */}
          <form onSubmit={handleAddDomain} className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="new-domain">Agregar dominio</Label>
              <Input
                id="new-domain"
                value={newDomain}
                onChange={(event) => setNewDomain(event.target.value)}
                placeholder="universidad.edu"
                disabled={addMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={addMutation.isPending || !newDomain.trim()}>
              {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar
            </Button>
          </form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isBusy}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
