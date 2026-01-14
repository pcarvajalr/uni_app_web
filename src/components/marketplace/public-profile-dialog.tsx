"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, ShoppingBag, Lock } from "lucide-react"
import { usePublicProfile } from "@/hooks/useUserProfile"

interface PublicProfileDialogProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublicProfileDialog({ userId, open, onOpenChange }: PublicProfileDialogProps) {
  const { data: profile, isLoading, error } = usePublicProfile(userId, open)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Perfil del Vendedor</DialogTitle>
          <DialogDescription>
            Informacion publica del vendedor
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <p className="text-destructive">Error al cargar el perfil</p>
          </div>
        )}

        {profile && !isLoading && (
          <>
            {!profile.is_profile_public ? (
              // Private profile message
              <div className="flex flex-col items-center space-y-4 py-8 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Perfil Privado</p>
                  <p className="text-sm text-muted-foreground">
                    Este usuario ha configurado su perfil como privado
                  </p>
                </div>
              </div>
            ) : (
              // Public profile content
              <div className="flex flex-col items-center space-y-6 py-4">
                {/* Avatar */}
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-semibold">{profile.full_name}</h3>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground max-w-xs">{profile.bio}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  {/* Rating */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-current text-yellow-400" />
                      <span className="font-semibold">
                        {profile.rating !== null ? profile.rating.toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Calificacion</span>
                  </div>

                  {/* Total Sales */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{profile.total_sales || 0}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Ventas</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
