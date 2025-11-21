# 🚀 Guía Completa de Despliegue

Esta guía te llevará paso a paso para desplegar tu aplicación UNI APP en Vercel con Supabase como backend.

## ✅ Pre-requisitos

- ✅ Código subido a GitHub (completado)
- ⚠️ Cuenta en Supabase ([crear cuenta](https://supabase.com))
- ⚠️ Cuenta en Vercel ([crear cuenta](https://vercel.com))

---

## 📦 PASO 1: Configurar Base de Datos en Supabase

### 1.1 Acceder al proyecto de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Abre tu proyecto existente: **scuvlkxrjvdyalcstccs** (Uni_AppDB)

### 1.2 Ejecutar el esquema de base de datos

1. En el dashboard de Supabase, ve a **SQL Editor** (icono de código en el menú lateral)
2. Abre el archivo `database.sql` de tu proyecto local
3. Copia TODO el contenido del archivo
4. Pega el contenido en el SQL Editor de Supabase
5. Click en **"Run"** o presiona `Ctrl/Cmd + Enter`

⏱️ **Tiempo estimado**: 10-30 segundos

✅ **Verificación**:
```sql
-- Ejecuta esto en el SQL Editor para verificar
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver 14 tablas:
- campus_locations
- categories
- coupons
- favorites
- messages
- notifications
- products
- reports
- reviews
- sales
- tutoring_bookings
- tutoring_sessions
- user_coupons
- users

### 1.3 Verificar datos iniciales

```sql
-- Verificar categorías
SELECT * FROM categories;

-- Verificar ubicaciones del campus
SELECT * FROM campus_locations;

-- Verificar cupón de bienvenida
SELECT * FROM coupons;
```

Deberías ver:
- **12 categorías** (6 para productos, 6 para tutorías)
- **4 ubicaciones** del campus
- **1 cupón** de bienvenida

---

## 🔐 PASO 2: Configurar Autenticación en Supabase

### 2.1 Configurar políticas de autenticación

1. Ve a **Authentication** → **Policies** en Supabase
2. Verifica que las políticas RLS estén habilitadas (ya lo están por el script SQL)

### 2.2 Configurar confirmación de email (opcional)

1. Ve a **Authentication** → **Email Templates**
2. Personaliza el template de confirmación si lo deseas
3. **Recomendación para desarrollo**:
   - Ve a **Authentication** → **Settings**
   - **Desactiva** "Enable email confirmations" para pruebas
   - Esto permite registro instantáneo sin confirmar email

### 2.3 Configurar URLs permitidas

1. Ve a **Authentication** → **URL Configuration**
2. En **Site URL**, agrega:
   ```
   http://localhost:3000
   ```
3. En **Redirect URLs**, agrega:
   ```
   http://localhost:3000
   http://localhost:3000/**
   ```

**IMPORTANTE**: Después del despliegue en Vercel, regresa aquí y agrega tu URL de producción.

---

## 📦 PASO 3: Obtener Credenciales de Supabase

### 3.1 Obtener URL y Keys

1. Ve a **Settings** → **API** en Supabase
2. Copia los siguientes valores:

```
Project URL: https://scuvlkxrjvdyalcstccs.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (solo para backend)
```

⚠️ **IMPORTANTE**:
- La `anon public key` es segura para usar en el frontend
- La `service_role key` NUNCA debe exponerse al cliente

---

## 🌐 PASO 4: Desplegar en Vercel

### Opción A: Desde el Dashboard de Vercel (Recomendado)

#### 4.1 Importar proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. En "Import Git Repository", busca: **pcarvajalr/uni_app_web**
4. Click en **"Import"**

#### 4.2 Configurar proyecto

Vercel detectará automáticamente que es un proyecto Vite. Verifica la configuración:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

✅ Todo debe estar correcto automáticamente.

#### 4.3 Configurar Variables de Entorno

**ANTES de hacer click en "Deploy"**, configura las variables de entorno:

1. En la sección **"Environment Variables"**, agrega:

```env
VITE_SUPABASE_URL
https://scuvlkxrjvdyalcstccs.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdXZsa3hyanZkeWFsY3N0Y2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTc2MDksImV4cCI6MjA3OTI3MzYwOX0.4_1g8KYLNnUk3Xf27izDKNtLoDW1rRM5j01QSjU__sA
```

2. Selecciona los ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

#### 4.4 Desplegar

1. Click en **"Deploy"**
2. ⏱️ Espera 2-3 minutos
3. ✅ Una vez completado, obtendrás una URL como: `https://uni-app-web-xxx.vercel.app`

---

### Opción B: Usando Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
# Pega: https://scuvlkxrjvdyalcstccs.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Pega tu anon key

# 4. Desplegar
vercel --prod
```

---

## ✅ PASO 5: Configuración Post-Despliegue

### 5.1 Actualizar URLs en Supabase

1. Regresa a Supabase Dashboard
2. Ve a **Authentication** → **URL Configuration**
3. Agrega tu URL de producción de Vercel:

```
Site URL: https://tu-app.vercel.app

Redirect URLs:
https://tu-app.vercel.app
https://tu-app.vercel.app/**
```

### 5.2 Actualizar variable VITE_APP_URL

1. En Vercel Dashboard, ve a tu proyecto
2. **Settings** → **Environment Variables**
3. Agrega o actualiza:

```
VITE_APP_URL
https://tu-app.vercel.app
```

4. **Redeploy** el proyecto:
   - Ve a **Deployments**
   - Click en los tres puntos del último deployment
   - Click en **"Redeploy"**

---

## 🧪 PASO 6: Probar la Aplicación

### 6.1 Abrir la aplicación

1. Ve a tu URL de Vercel: `https://tu-app.vercel.app`

### 6.2 Registrar un usuario de prueba

1. Click en **"Registrarse"** o **"Crear cuenta"**
2. Llena el formulario:
   ```
   Nombre: Usuario de Prueba
   Email: test@example.com
   Contraseña: Test123456
   ```
3. Click en **"Registrarse"**

### 6.3 Verificar funcionalidades

✅ **Autenticación**
- Deberías poder registrarte
- Deberías poder iniciar sesión
- Deberías ver tu perfil

✅ **Dashboard**
- Accede al dashboard
- Verifica que cargue sin errores

✅ **Marketplace**
- Ve a la sección Marketplace
- Intenta crear un producto de prueba

✅ **Tutorías**
- Ve a la sección Tutorías
- Verifica que se carguen las categorías

### 6.4 Verificar consola del navegador

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Verifica que NO haya errores rojos relacionados con:
   - Supabase connection
   - Environment variables
   - CORS errors

---

## 🐛 Troubleshooting

### Error: "Missing environment variables"

**Causa**: Las variables de entorno no están configuradas correctamente.

**Solución**:
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` existan
3. Verifica que tengan el prefijo `VITE_`
4. Redeploy el proyecto

### Error: "Invalid API key" o "Unauthorized"

**Causa**: La anon key es incorrecta o ha expirado.

**Solución**:
1. Ve a Supabase Dashboard → Settings → API
2. Copia la **anon public key** actualizada
3. Actualiza en Vercel Environment Variables
4. Redeploy

### Error: "CORS policy"

**Causa**: Tu URL de Vercel no está en las URLs permitidas de Supabase.

**Solución**:
1. Ve a Supabase Dashboard → Authentication → URL Configuration
2. Agrega tu URL de Vercel en **Redirect URLs**
3. Guarda cambios
4. Espera 1-2 minutos para que se propague

### Error: "Table does not exist"

**Causa**: El esquema SQL no se ejecutó correctamente.

**Solución**:
1. Ve a Supabase SQL Editor
2. Ejecuta este query para verificar:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
3. Si no ves las 14 tablas, vuelve a ejecutar `database.sql`

### Build falla en Vercel

**Causa**: Errores de TypeScript o dependencias faltantes.

**Solución**:
1. Ve a Vercel Dashboard → Deployments → [último deployment] → Building
2. Lee el log de error completo
3. Si es un error de tipos, puede que falte ejecutar:
   ```bash
   npm install
   npm run build
   ```
   localmente primero para detectar el error

### La aplicación se ve rota o sin estilos

**Causa**: Build de assets falló o configuración de Vite incorrecta.

**Solución**:
1. Verifica que `vercel.json` exista en el repositorio
2. Verifica que el `outputDirectory` sea `dist`
3. Redeploy desde Vercel

---

## 📊 Métricas de Éxito

✅ **Aplicación desplegada**: https://tu-app.vercel.app
✅ **Base de datos configurada**: 14 tablas creadas
✅ **Autenticación funcionando**: Puedes registrarte e iniciar sesión
✅ **Sin errores en consola**: No hay errores en DevTools
✅ **Navegación funcional**: Todas las páginas cargan correctamente

---

## 📞 Siguiente Pasos

### Para desarrollo móvil (Capacitor):

```bash
# Sincronizar código
npm run build
npm run cap:sync

# Abrir Android Studio
npm run cap:android

# Abrir Xcode (Mac only)
npm run cap:ios
```

### Para agregar dominio personalizado:

1. Ve a Vercel Dashboard → Settings → Domains
2. Click en **"Add"**
3. Ingresa tu dominio (ej: `uniapp.com`)
4. Sigue las instrucciones para configurar DNS

---

## 🎉 ¡Felicidades!

Tu aplicación UNI APP está desplegada y funcionando en producción.

**URLs importantes**:
- 🌐 Aplicación: https://tu-app.vercel.app
- 💾 Supabase Dashboard: https://supabase.com/dashboard/project/scuvlkxrjvdyalcstccs
- 🚀 Vercel Dashboard: https://vercel.com/dashboard

---

**¿Necesitas ayuda?** Revisa la sección de Troubleshooting o consulta la documentación oficial:
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
