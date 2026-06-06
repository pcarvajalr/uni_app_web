import { useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Mail, Phone } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMarkContactMessageAsRead } from "@/hooks/useContactMessages"
import type { ContactMessage } from "@/services/contact-messages.service"

interface ContactMessageDialogProps {
  message: ContactMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactMessageDialog({ message, open, onOpenChange }: ContactMessageDialogProps) {
  const markAsRead = useMarkContactMessageAsRead()

  useEffect(() => {
    if (open && message && message.status === "new") {
      markAsRead.mutate(message.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, message?.id])

  if (!message) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Mensaje de contacto</DialogTitle>
          <DialogDescription>
            {message.created_at
              ? format(new Date(message.created_at), "dd MMM yyyy, HH:mm", { locale: es })
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{message.email}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${message.email}`}>Escribir</a>
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{message.phone}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${message.phone}`}>Llamar</a>
            </Button>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
