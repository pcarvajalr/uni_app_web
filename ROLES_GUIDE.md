# 🔐 Sistema de Roles y Permisos - UNI APP

Este documento describe el sistema de roles implementado en la aplicación UNI APP.

---

## 📋 Roles Disponibles

### 1. **Usuario Normal (user)**
- **Rol por defecto**: Todos los usuarios registrados tienen este rol automáticamente
- **Acceso**: Funcionalidades básicas de la aplicación
- **Restricciones**: No puede acceder a funciones administrativas

### 2. **Administrador (admin)**
- **Asignación**: Solo mediante UPDATE directo en la base de datos
- **Acceso**: Acceso completo a todas las funcionalidades
- **Permisos especiales**: Gestión de reportes, cupones, categorías, ubicaciones, etc.

---

## 🔒 Cómo Funciona

### Asignación Automática de Roles

Cuando un usuario se registra en la aplicación:
1. Se crea su cuenta en `auth.users` de Supabase
2. Un trigger automático crea su perfil en `public.users`
3. El campo `role` se establece automáticamente en `'user'`

```sql
-- El trigger automático establece role = 'user' por defecto
role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')) NOT NULL
```

### Promoción a Administrador

**⚠️ IMPORTANTE**: Los usuarios NO pueden auto-promocionarse a admin desde la aplicación. La promoción solo se puede hacer mediante SQL directo en Supabase.

#### Método 1: Mediante SQL Editor de Supabase

```sql
-- Actualizar un usuario a admin por su email
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@example.com';

-- O por su ID
UPDATE public.users
SET role = 'admin'
WHERE id = 'uuid-del-usuario';
```

#### Método 2: Mediante la interfaz de Supabase

1. Ve a **Table Editor** en Supabase Dashboard
2. Selecciona la tabla `users`
3. Busca el usuario que quieres promocionar
4. Edita el campo `role` y cámbialo de `user` a `admin`
5. Guarda los cambios

---

## 🛡️ Políticas de Seguridad (RLS)

El sistema usa Row Level Security (RLS) para proteger los datos:

### Política Especial para el Campo Role

```sql
-- Los admins NO pueden actualizar el rol de otros usuarios desde la app
-- Solo pueden actualizarse a sí mismos o mantener el rol existente
CREATE POLICY "Los admins NO pueden actualizar el rol de otros (solo via SQL directo)"
  ON public.users FOR UPDATE
  USING (public.is_admin() AND (NEW.role = OLD.role OR NEW.id = auth.uid()));
```

Esta política **previene que los admins creen más admins desde la aplicación**, manteniendo el control centralizado en la base de datos.

---

## 📊 Permisos por Rol

### Permisos de Usuario Normal (user)

#### ✅ Puede:
- Ver productos disponibles
- Crear y vender sus propios productos
- Comprar productos de otros
- Ver sesiones de tutoría activas
- Crear sesiones de tutoría (si es tutor)
- Reservar tutorías
- Crear reportes de seguridad
- Ver reportes públicos
- Ver y usar cupones activos
- Ver categorías
- Ver ubicaciones del campus
- Ver y gestionar sus propias notificaciones
- Enviar y recibir mensajes
- Agregar favoritos
- Crear reseñas

#### ❌ No puede:
- Actualizar reportes de otros usuarios
- Eliminar reportes de otros
- Cambiar estado de reportes
- Crear, editar o eliminar cupones
- Ver cupones inactivos o expirados
- Crear, editar o eliminar categorías
- Crear, editar o eliminar ubicaciones del campus
- Crear notificaciones para otros usuarios
- Ver notificaciones de otros usuarios
- Acceder a estadísticas globales

---

### Permisos de Administrador (admin)

#### ✅ Todos los permisos de usuario +

**Gestión de Reportes**:
- Actualizar cualquier reporte
- Eliminar reportes
- Cambiar estado de reportes (open, in_progress, resolved, closed, rejected)
- Asignar reportes a departamentos
- Ver estadísticas de reportes

**Gestión de Cupones**:
- Ver todos los cupones (activos, inactivos, expirados)
- Crear nuevos cupones
- Editar cupones existentes
- Eliminar cupones
- Ver estadísticas de uso

**Gestión de Categorías**:
- Crear nuevas categorías
- Editar categorías existentes
- Eliminar categorías

**Gestión de Ubicaciones del Campus**:
- Crear nuevas ubicaciones
- Editar ubicaciones existentes
- Eliminar ubicaciones

**Gestión de Notificaciones**:
- Crear notificaciones para cualquier usuario
- Ver todas las notificaciones del sistema
- Crear notificaciones globales/broadcast

**Acceso a Datos**:
- Ver todos los usuarios
- Ver detalles de usuarios
- Acceso a estadísticas y analytics
- Exportar datos

---

## 💻 Uso en el Código

### Verificar si el usuario es admin

```typescript
import { useAuth } from '@/lib/auth';
import { useIsAdmin } from '@/lib/permissions';

function MyComponent() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  // Opción 1: usando el hook
  if (isAdmin) {
    // Mostrar funcionalidades de admin
  }

  // Opción 2: verificando directamente el rol
  if (user?.role === 'admin') {
    // Mostrar funcionalidades de admin
  }

  return <div>...</div>;
}
```

### Proteger componentes

```typescript
import { RequireAdmin } from '@/lib/permissions';

function AdminPanel() {
  return (
    <RequireAdmin fallback={<div>No tienes permisos</div>}>
      <div>
        {/* Contenido solo visible para admins */}
      </div>
    </RequireAdmin>
  );
}
```

### Verificar permisos específicos

```typescript
import { hasPermission, ADMIN_PERMISSIONS } from '@/lib/permissions';

function ReportsList() {
  const { user } = useAuth();

  const canUpdateAnyReport = hasPermission(user?.role, ADMIN_PERMISSIONS.UPDATE_ANY_REPORT);

  return (
    <div>
      {canUpdateAnyReport && (
        <button>Actualizar Reporte</button>
      )}
    </div>
  );
}
```

### Verificar restricciones

```typescript
import { useIsRestricted } from '@/lib/permissions';

function CouponsList() {
  const isRestricted = useIsRestricted('CREATE_COUPONS');

  return (
    <div>
      {!isRestricted && (
        <button>Crear Nuevo Cupón</button>
      )}
    </div>
  );
}
```

---

## 🎨 UI/UX para Roles

### Mostrar badge de rol

```typescript
import { getRoleName, getRoleColor } from '@/lib/permissions';

function UserProfile() {
  const { user } = useAuth();

  return (
    <div>
      <span className={getRoleColor(user?.role)}>
        {getRoleName(user?.role)}
      </span>
    </div>
  );
}
```

Resultado:
- **Administrador**: Badge rojo
- **Usuario**: Badge azul

---

## 🔍 Función Helper en Base de Datos

La base de datos incluye una función helper para verificar si el usuario actual es admin:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Esta función se usa en las políticas RLS para controlar el acceso.

---

## 📝 Ejemplos de Casos de Uso

### Caso 1: Dashboard Administrativo

```typescript
function Dashboard() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Panel de Administración</h1>
      <ReportsManagement />
      <CouponsManagement />
      <CategoriesManagement />
      <StatisticsPanel />
    </div>
  );
}
```

### Caso 2: Gestión de Reportes

```typescript
function ReportCard({ report }) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isReporter = report.reporter_id === user?.id;

  return (
    <div>
      <h3>{report.title}</h3>
      <p>{report.description}</p>

      {/* Solo el reportador puede editar su reporte */}
      {isReporter && <button>Editar</button>}

      {/* Solo los admins pueden cambiar el estado */}
      {isAdmin && (
        <select value={report.status}>
          <option value="open">Abierto</option>
          <option value="in_progress">En Progreso</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>
      )}

      {/* Solo los admins pueden eliminar */}
      {isAdmin && <button>Eliminar</button>}
    </div>
  );
}
```

### Caso 3: Creación de Cupones

```typescript
function CouponsPage() {
  const isAdmin = useIsAdmin();

  return (
    <div>
      <h1>Cupones</h1>

      {/* Todos pueden ver cupones activos */}
      <CouponsList />

      {/* Solo admins pueden crear cupones */}
      {isAdmin && (
        <div>
          <button onClick={openCreateCouponModal}>
            Crear Nuevo Cupón
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Flujo de Autenticación con Roles

```
1. Usuario se registra
   └─> Trigger crea perfil con role='user'

2. Usuario inicia sesión
   └─> Se carga el perfil con el role

3. En cada request:
   └─> RLS verifica el role automáticamente
   └─> Permite o deniega acceso según políticas

4. Promoción a admin (manual):
   └─> UPDATE en Supabase SQL Editor
   └─> Usuario cierra sesión y vuelve a iniciar
   └─> Ahora tiene permisos de admin
```

---

## ⚠️ Consideraciones de Seguridad

1. **El campo `role` NUNCA debe ser editable desde la aplicación**
   - Solo mediante SQL directo en Supabase

2. **Las políticas RLS previenen escalación de privilegios**
   - Incluso los admins no pueden cambiar roles desde la app

3. **Verificar siempre el rol en el frontend Y en el backend**
   - El frontend verifica para UX
   - El backend (RLS) verifica para seguridad

4. **No confiar solo en el frontend**
   - Siempre usar políticas RLS en Supabase
   - Las verificaciones de frontend son solo para UX

5. **Auditar cambios de roles**
   - Considerar logging de cambios de rol
   - Mantener registro de quién promocionó a admin

---

## 🧪 Testing

### Crear usuario admin de prueba

```sql
-- 1. Registrar usuario desde la app
-- 2. Promocionar a admin via SQL
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin-test@example.com';
```

### Verificar permisos

```sql
-- Ver todos los admins
SELECT id, email, full_name, role
FROM public.users
WHERE role = 'admin';

-- Verificar que la función is_admin() funciona
SELECT public.is_admin(); -- Ejecutar estando logueado como admin
```

---

## 📚 Referencias

- **Archivo de permisos**: `/src/lib/permissions.ts`
- **Sistema de autenticación**: `/src/lib/auth.tsx`
- **Tipos de base de datos**: `/src/types/database.types.ts`
- **Esquema SQL**: `/database.sql`

---

## 🆘 Soporte

Si tienes problemas con el sistema de roles:

1. Verifica que ejecutaste el script `database.sql` completo
2. Confirma que el trigger de creación de perfiles funciona
3. Verifica las políticas RLS en Supabase Dashboard
4. Revisa los logs de autenticación en la consola del navegador

---

**Última actualización**: 2025-01-21
