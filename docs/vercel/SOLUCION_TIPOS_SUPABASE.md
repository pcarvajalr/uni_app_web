# Solución a Errores de Tipos de Supabase

## Problema

Los errores de build en Vercel están causados porque TypeScript está infiriendo el tipo `never` para las operaciones de Supabase (`.select()`, `.insert()`, `.update()`, etc.). Esto sucede cuando:

1. Los tipos generados en `database.types.ts` no coinciden exactamente con el esquema de la base de datos
2. Los tipos no están correctamente sincronizados con la versión de `@supabase/supabase-js` (v2.84.0)
3. El cliente de Supabase no puede inferir correctamente los tipos de las tablas

## Errores Identificados

- **90+ errores de TypeScript** en total
- Archivos afectados:
  - `src/lib/auth.tsx` (27 errores)
  - `src/services/coupons.service.ts`
  - `src/services/notifications.service.ts`
  - `src/services/products.service.ts`
  - `src/services/reports.service.ts`
  - `src/services/tutoring.service.ts`

## Cambios Realizados

1. ✅ Modificada función `handleSupabaseError` con tipo de retorno correcto
2. ✅ Agregada función `unwrapData` para manejar respuestas de Supabase
3. ✅ Actualizados todos los servicios para usar `unwrapData`
4. ✅ Instalado Supabase CLI como dev dependency

## Solución Recomendada

Para resolver completamente el problema, se necesita:

### Opción 1: Regenerar Tipos desde Supabase (Recomendada)

Requiere un access token de Supabase. El usuario debe:

1. Hacer login en Supabase CLI:
   ```bash
   npx supabase login
   ```

2. Regenerar los tipos:
   ```bash
   npx supabase gen types typescript --project-id scuvlkxrjvdyalcstccs --schema public > src/types/database.types.ts
   ```

### Opción 2: Solución Temporal con Type Assertions

Agregar type assertions en lugares estratégicos para bypasear los errores de tipos:

1. En `src/lib/supabase.ts`:
   - Tipar explícitamente el cliente con `as SupabaseClient<Database>`

2. En archivos de servicio:
   - Usar type assertions cuando sea necesario

### Opción 3: Usar Tipos más Permisivos

Modificar `tsconfig.app.json` temporalmente:
```json
{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}
```

⚠️ **No recomendado** para producción, solo para desbloquear el deploy inmediato.

## Próximos Pasos

1. El usuario debe generar un access token de Supabase
2. Regenerar los tipos usando el comando oficial
3. Verificar que el build funcione correctamente
4. Hacer commit y push para redeploy en Vercel

## Notas Técnicas

- Version de Supabase: `@supabase/supabase-js@2.84.0`
- TypeScript: `^5.3.3`
- El problema es común en proyectos que usan tipos generados manualmente en lugar de auto-generados
