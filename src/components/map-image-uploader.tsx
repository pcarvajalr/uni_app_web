import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { uploadMapImage, validateImageFile } from '@/services/storage.service'
import { updateMapImageUrl } from '@/services/campus-settings.service'
import { toast } from '@/hooks/use-toast'

interface MapImageUploaderProps {
  currentImageUrl?: string
  onUploadSuccess?: (newUrl: string) => void
}

export function MapImageUploader({
  currentImageUrl,
  onUploadSuccess,
}: MapImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validar archivo
    const validation = validateImageFile(file, 5) // 5MB máximo
    if (!validation.isValid) {
      setError(validation.error || 'Archivo inválido')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
      setSelectedFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('No hay archivo seleccionado')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Subir imagen a Supabase Storage
      const uploadResult = await uploadMapImage(selectedFile)

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Error al subir la imagen')
      }

      // Actualizar configuración en la base de datos
      await updateMapImageUrl(uploadResult.url)

      toast({
        title: 'Mapa actualizado',
        description: 'La imagen del mapa se ha actualizado correctamente',
      })

      // Notificar al componente padre
      onUploadSuccess?.(uploadResult.url)

      // Limpiar estado
      setPreviewUrl(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error al subir imagen:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error al subir la imagen'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Imagen del Mapa del Campus</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Sube una imagen que será utilizada como mapa del campus para todas las ubicaciones
        </p>
      </div>

      {/* Imagen actual */}
      {currentImageUrl && !previewUrl && (
        <div className="border rounded-lg p-2 bg-muted/50">
          <p className="text-sm font-medium mb-2">Imagen actual:</p>
          <div className="aspect-video relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
            <img
              src={currentImageUrl}
              alt="Mapa del campus actual"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Preview de nueva imagen */}
      {previewUrl && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Nueva imagen:</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
          <div className="aspect-video relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview del nuevo mapa"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input de archivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botones de acción */}
      <div className="flex gap-2">
        {!previewUrl ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Seleccionar Imagen
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Actualizar Mapa
              </>
            )}
          </Button>
        )}
      </div>

      {/* Información adicional */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Formatos aceptados: JPG, PNG, WebP</p>
        <p>• Tamaño máximo: 5MB</p>
        <p>• Recomendado: Imagen en formato horizontal (landscape)</p>
      </div>
    </div>
  )
}
