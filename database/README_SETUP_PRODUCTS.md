# 📦 Configuración del Bucket de Productos - Marketplace

Este documento explica cómo configurar el storage bucket para las imágenes de productos del marketplace.

## ⚠️ Importante

**NO puedes crear el bucket directamente con SQL** debido a restricciones de permisos en Supabase. Debes crearlo manualmente desde el Dashboard de Supabase y luego ejecutar el script SQL para las políticas.

---

## 🚀 Pasos de Configuración

### Paso 1: Crear el Bucket desde el Dashboard

1. **Accede a tu proyecto de Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Ve a la sección Storage**
   - En el menú lateral izquierdo, haz clic en **Storage**
   - Deberías ver una lista de buckets existentes (si hay alguno)

3. **Crear nuevo bucket**
   - Haz clic en el botón **"New bucket"** (esquina superior derecha)
   - Se abrirá un modal de configuración

4. **Configurar el bucket con estos valores exactos:**

   | Campo | Valor | Descripción |
   |-------|-------|-------------|
   | **Name** | `products` | Nombre del bucket (debe ser exactamente "products") |
   | **Public bucket** | ✅ **Activado** | Permite acceso público a las imágenes |
   | **File size limit** | `5242880` | 5MB en bytes (opcional si no está disponible) |
   | **Allowed MIME types** | `image/jpeg`<br>`image/jpg`<br>`image/png`<br>`image/webp` | Solo estos tipos de imagen (opcional si no está disponible) |

5. **Crear el bucket**
   - Haz clic en **"Create bucket"** o **"Save"**
   - Deberías ver el nuevo bucket `products` en la lista

### Paso 2: Ejecutar el Script SQL para las Políticas

Una vez creado el bucket, ejecuta el script SQL para configurar las políticas de seguridad:

1. **Ve al SQL Editor**
   - En el menú lateral de Supabase, haz clic en **SQL Editor**

2. **Crear nueva query**
   - Haz clic en **"New query"**

3. **Copiar el script**
   - Abre el archivo `database/005_setup_products_storage.sql`
   - Copia TODO el contenido del archivo

4. **Ejecutar el script**
   - Pega el contenido en el SQL Editor
   - Haz clic en **"Run"** o presiona `Ctrl/Cmd + Enter`

5. **Verificar éxito**
   - Deberías ver un mensaje de éxito sin errores
   - Si hay errores, verifica que el bucket `products` existe

---

## ✅ Verificación

### Verificar que el bucket se creó correctamente:

1. Ve a **Storage** en el panel de Supabase
2. Deberías ver un bucket llamado **`products`**
3. Haz clic en el bucket para ver sus detalles:
   - ✅ **Public**: Sí
   - ✅ **File size limit**: 5MB (si está configurado)
   - ✅ **Allowed MIME types**: image/jpeg, image/jpg, image/png, image/webp (si está configurado)

### Verificar que las políticas se crearon:

Ejecuta este SQL en el SQL Editor:

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%productos%';
```

Deberías ver 4 políticas:
- ✅ Usuarios autenticados pueden subir imágenes de productos
- ✅ Todos pueden ver imágenes de productos
- ✅ Usuarios pueden eliminar sus propias imágenes de productos
- ✅ Usuarios pueden actualizar sus propias imágenes de productos

---

## 📋 Políticas de Storage Configuradas

El script `005_setup_products_storage.sql` configura automáticamente las siguientes políticas:

| Política | Acción | Quién | Descripción |
|----------|--------|-------|-------------|
| **Subir imágenes** | INSERT | Usuarios autenticados | Los usuarios pueden subir imágenes solo a su propia carpeta (`{user_id}/`) |
| **Ver imágenes** | SELECT | Público | Cualquiera puede ver las imágenes (bucket público) |
| **Eliminar imágenes** | DELETE | Usuarios autenticados | Los usuarios solo pueden eliminar sus propias imágenes |
| **Actualizar imágenes** | UPDATE | Usuarios autenticados | Los usuarios solo pueden actualizar sus propias imágenes |

---

## 📁 Estructura de Carpetas

Las imágenes se organizan automáticamente por usuario:

```
products/
  └── {user_id}/
      ├── 1234567890_producto1.jpg
      ├── 1234567891_producto2.png
      └── 1234567892_producto3.webp
```

**Ejemplo real:**
```
products/
  └── a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6/
      ├── 1704123456789_iphone13.jpg
      ├── 1704123457890_macbook.png
      └── 1704123458901_calculadora.webp
```

---

## 🔧 Solución de Problemas

### ❌ Error: "must be owner of table buckets"

**Causa:** Intentaste crear el bucket con SQL en lugar de desde el Dashboard.

**Solución:**
1. **NO** ejecutes la parte del `INSERT INTO storage.buckets`
2. Crea el bucket manualmente desde el Dashboard (ver Paso 1 arriba)
3. Solo ejecuta el script SQL para las políticas

---

### ❌ Error: "policy for relation 'objects' already exists"

**Causa:** Las políticas ya fueron creadas anteriormente.

**Solución:**
- El script ya incluye `DROP POLICY IF EXISTS`, así que puedes re-ejecutarlo sin problema
- O ignora este error si las políticas ya están configuradas correctamente

---

### ❌ Error: "relation 'products' does not exist" al ejecutar políticas

**Causa:** El bucket `products` no existe aún.

**Solución:**
1. Ve a **Storage** en Supabase
2. Verifica que el bucket `products` existe
3. Si no existe, créalo manualmente (ver Paso 1 arriba)
4. Vuelve a ejecutar el script SQL

---

### ❌ Las imágenes no se suben desde la aplicación

**Verifica:**

1. ✅ **Bucket existe y es público**
   - Ve a Storage → products
   - Verifica que "Public" está activado

2. ✅ **Políticas están activas**
   - Ejecuta la query de verificación (ver sección Verificación)
   - Deberían aparecer 4 políticas

3. ✅ **Usuario está autenticado**
   - Verifica que `user.id` existe al intentar subir
   - Las políticas requieren que el usuario esté logueado

4. ✅ **Tamaño del archivo**
   - Máximo 5MB por imagen
   - Verifica en `src/lib/product-validation.ts`

5. ✅ **Tipo de archivo**
   - Solo JPEG, JPG, PNG, WebP
   - Verifica en `src/lib/product-validation.ts`

6. ✅ **Permisos de CORS** (si es necesario)
   - Ve a Storage → Configuración
   - Verifica que CORS permite tu dominio

---

## 📚 Recursos Adicionales

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas de Storage en Supabase](https://supabase.com/docs/guides/storage/security/access-control)
- [Límites de tamaño de archivo](https://supabase.com/docs/guides/storage/uploads/file-limits)

---

## ✨ ¡Listo!

Una vez completados ambos pasos, tu sistema de publicación de productos estará completamente funcional con:
- ✅ Almacenamiento de imágenes en Supabase Storage
- ✅ Políticas de seguridad configuradas
- ✅ Validación de archivos en el cliente
- ✅ Organización automática por usuario

Ahora puedes publicar productos con imágenes desde la aplicación. 🚀
