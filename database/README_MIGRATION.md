# Instrucciones de Migración: Soporte de Imágenes para Cupones

## 📋 Descripción
Esta migración añade soporte completo para imágenes de cupones, incluyendo:
- Campo `image_url` en la tabla `coupons`
- Bucket de Storage `coupons` para almacenar imágenes
- Políticas RLS para controlar acceso al bucket

---

## ⚠️ IMPORTANTE: Orden de Ejecución

**Debes seguir este orden exacto:**
1. **PRIMERO:** Crear el bucket desde la interfaz de Supabase Storage
2. **SEGUNDO:** Ejecutar el script SQL para añadir columna y políticas

> **Nota:** No se puede crear el bucket con SQL porque la tabla `storage.buckets` es del sistema y requiere permisos especiales.

---

## 🚀 PASO 1: Crear el Bucket de Storage

### Opción A: Usando la Interfaz Web (Recomendado)

1. **Accede a tu proyecto de Supabase:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Storage:**
   - En el menú lateral izquierdo, haz clic en **"Storage"**
   - Verás una lista de buckets existentes

3. **Crea el nuevo bucket:**
   - Haz clic en el botón **"New bucket"** (esquina superior derecha)
   - Completa el formulario con estos valores:

   ```
   Name: coupons
   Public bucket: ✅ (activado)
   ```

4. **Configura restricciones de archivos:**
   - Después de crear el bucket, haz clic en el bucket `coupons`
   - Ve a **"Configuration"** o **"Settings"**
   - Configura:
     - **File size limit:** 2 MB (2097152 bytes)
     - **Allowed MIME types:** `image/jpeg, image/jpg, image/png, image/webp`

5. **Verifica la creación:**
   - Deberías ver el bucket `coupons` en la lista
   - Debe tener un icono de 🌐 indicando que es público

### Opción B: Usando la API de Supabase (Avanzado)

Si tienes acceso a la Management API, puedes crear el bucket con JavaScript:

```javascript
const { data, error } = await supabase
  .storage
  .createBucket('coupons', {
    public: true,
    fileSizeLimit: 2097152,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  })
```

---

## 🗄️ PASO 2: Ejecutar el Script SQL

Una vez que el bucket esté creado, ejecuta el script SQL para añadir la columna y las políticas.

### Usando el SQL Editor de Supabase

1. **Abre el SQL Editor:**
   - En tu proyecto de Supabase, ve a **"SQL Editor"** en el menú lateral
   - Haz clic en **"New query"**

2. **Copia el script:**
   - Abre el archivo `database/004_add_coupons_image_support.sql`
   - Copia **todo** el contenido

3. **Pega y ejecuta:**
   - Pega el contenido en el editor SQL
   - Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

4. **Verifica el resultado:**
   - Deberías ver un mensaje de éxito
   - Si ves errores, consulta la sección de **Troubleshooting** más abajo

---

## ✅ PASO 3: Verificación

Después de ejecutar la migración, verifica que todo esté correcto:

### 3.1. Verificar la columna `image_url`

Ejecuta en el SQL Editor:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'coupons' AND column_name = 'image_url';
```

**Resultado esperado:**
```
column_name | data_type | is_nullable
------------|-----------|------------
image_url   | text      | YES
```

### 3.2. Verificar el bucket

Ejecuta:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'coupons';
```

**Resultado esperado:**
```
id      | name    | public | file_size_limit | allowed_mime_types
--------|---------|--------|-----------------|--------------------
coupons | coupons | true   | 2097152         | {image/jpeg, ...}
```

### 3.3. Verificar las políticas

Ejecuta:

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%cupones%'
ORDER BY policyname;
```

**Resultado esperado:** Deberías ver 4 políticas:
1. `Los admins pueden eliminar imágenes de cupones` (DELETE)
2. `Los admins pueden subir imágenes de cupones` (INSERT)
3. `Los admins pueden actualizar imágenes de cupones` (UPDATE)
4. `Todos pueden ver imágenes de cupones` (SELECT)

---

## 🧪 PASO 4: Prueba la Funcionalidad

1. **Como Administrador:**
   - Ve a **Configuración** → **Gestión de Cupones**
   - Crea un nuevo cupón con todos los campos
   - Sube una imagen (JPG, PNG o WebP, máx 2MB)
   - Guarda el cupón

2. **Verifica en la base de datos:**
   ```sql
   SELECT id, title, code, image_url
   FROM public.coupons
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. **Como Usuario:**
   - Ve a la página de **Cupones**
   - Verifica que aparece el cupón creado
   - La imagen debe cargarse correctamente

---

## 🐛 Troubleshooting

### Error: "relation storage.buckets does not exist"
**Causa:** El proyecto no tiene Storage habilitado.
**Solución:** Activa Storage desde el dashboard de Supabase.

### Error: "policy already exists"
**Causa:** Estás ejecutando el script por segunda vez.
**Solución:** No es un error crítico, las políticas ya existen. Puedes ignorarlo.

### Error: "column image_url already exists"
**Causa:** La columna ya fue añadida previamente.
**Solución:** No es un error crítico, puedes continuar.

### Error: "permission denied for table objects"
**Causa:** No tienes permisos de administrador.
**Solución:** Contacta al propietario del proyecto de Supabase.

### Las imágenes no se suben
**Posibles causas:**
1. El bucket no existe → Verifica con la query del paso 3.2
2. El bucket no es público → Edita el bucket desde Storage y activa "Public"
3. Las políticas no están activas → Verifica con la query del paso 3.3
4. La función `is_admin()` no existe → Revisa `database/001_create_database.sql`

### Las imágenes no se ven en la página de cupones
**Posibles causas:**
1. La URL de imagen es incorrecta → Verifica la columna `image_url`
2. El bucket es privado → Hazlo público desde Storage
3. CORS no configurado → Debería estar configurado automáticamente para buckets públicos

---

## 🔄 Rollback (Deshacer la Migración)

Si necesitas revertir los cambios:

### 1. Eliminar las políticas
```sql
DROP POLICY IF EXISTS "Todos pueden ver imágenes de cupones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden subir imágenes de cupones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden actualizar imágenes de cupones" ON storage.objects;
DROP POLICY IF EXISTS "Los admins pueden eliminar imágenes de cupones" ON storage.objects;
```

### 2. Eliminar la columna
```sql
ALTER TABLE public.coupons DROP COLUMN IF EXISTS image_url;
```

### 3. Eliminar el bucket
- Ve a **Storage** en el dashboard
- Selecciona el bucket `coupons`
- Haz clic en **"Delete bucket"**
- Confirma la eliminación

> ⚠️ **ADVERTENCIA:** Eliminar el bucket borrará TODAS las imágenes de cupones almacenadas.

---

## 📚 Referencias

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas RLS en Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor)

---

## 📞 Soporte

Si encuentras problemas no listados aquí:
1. Verifica los logs en el dashboard de Supabase
2. Revisa la consola del navegador para errores de frontend
3. Consulta la documentación oficial de Supabase
