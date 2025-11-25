# Quickstart: Módulo de Tutorías

**Feature**: 001-tutoring-module
**Date**: 2025-11-25

## Prerequisites

- Node.js 18+ instalado
- Cuenta de Supabase con proyecto configurado
- Variables de entorno configuradas

## Setup

### 1. Clonar y cambiar a la rama

```bash
git checkout 001-tutoring-module
cd /Users/pedrocarvajal/Documents/GitHub/UNI_APP/web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Verificar que `.env` contenga:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Database

### Verificar esquema existente

Las tablas necesarias ya existen en Supabase:

- `tutoring_sessions`
- `tutoring_bookings`
- `messages`
- `favorites`
- `reviews`
- `categories`
- `users`

### Regenerar tipos (si hay cambios de esquema)

```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```

## Development

### Estructura de archivos a crear/modificar

```
src/
├── components/tutoring/
│   ├── create-tutoring-dialog.tsx    # MODIFICAR
│   ├── tutoring-details-dialog.tsx   # MODIFICAR
│   ├── booking-dialog.tsx            # CREAR
│   ├── booking-calendar.tsx          # CREAR
│   ├── tutoring-messages.tsx         # CREAR
│   ├── tutoring-review.tsx           # CREAR
│   └── tutoring-card.tsx             # CREAR
├── pages/
│   ├── TutoringPage.tsx              # MODIFICAR
│   ├── MySessionsPage.tsx            # MODIFICAR
│   └── TutoringBookingsPage.tsx      # CREAR
├── services/
│   ├── tutoring.service.ts           # MODIFICAR
│   └── tutoring-messages.service.ts  # CREAR
└── hooks/
    ├── useTutoringSessions.ts        # CREAR
    ├── useTutoringBookings.ts        # CREAR
    └── useTutoringMessages.ts        # CREAR
```

### Patrones de código existentes

#### Servicio con Supabase

```typescript
// src/services/example.service.ts
import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Entity = Database['public']['Tables']['entity_name']['Row'];

export const getEntities = async () => {
  try {
    const { data, error } = await supabase
      .from('entity_name')
      .select('*')
      .order('created_at', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

#### Componente de diálogo

```typescript
// src/components/example/example-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: SomeType;
}

export function ExampleDialog({ open, onOpenChange, data }: ExampleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Título</DialogTitle>
        </DialogHeader>
        {/* contenido */}
      </DialogContent>
    </Dialog>
  );
}
```

#### Página con layout

```typescript
// src/pages/ExamplePage.tsx
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExamplePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Título</h1>
          <p className="text-muted-foreground">Descripción</p>
        </div>
        {/* contenido */}
      </div>
    </AppLayout>
  );
}
```

## Testing

No hay configuración de tests actualmente en el proyecto.

Para testing manual:

1. Crear cuenta de usuario test
2. Probar flujo de creación de tutoría
3. Probar reserva desde otra cuenta
4. Verificar estados de reserva
5. Probar mensajes entre usuarios
6. Verificar reseñas post-completación

## Build

```bash
npm run build
```

### Build para móvil

```bash
npm run build
npm run cap:sync
npm run cap:android  # o cap:ios
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Cliente Supabase configurado |
| `src/lib/auth.tsx` | Context de autenticación |
| `src/types/database.types.ts` | Tipos generados de Supabase |
| `src/components/ui/*` | Componentes UI (Radix + Tailwind) |
| `src/services/tutoring.service.ts` | Servicio de tutorías existente |
| `src/pages/TutoringPage.tsx` | Página principal de tutorías |

## Common Issues

### Error: "supabase is not defined"

Verificar que las variables de entorno estén configuradas en `.env`.

### Error: "Row Level Security"

Verificar que el usuario esté autenticado y que las políticas RLS permitan la operación.

### Tipos no coinciden

Regenerar tipos con:

```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```
