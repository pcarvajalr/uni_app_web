# UNI APP - Aplicación Universitaria

Aplicación web y móvil multiplataforma para estudiantes universitarios, con funcionalidades de marketplace, tutorías, reportes de seguridad, y más.

## 🚀 Tecnologías

- **Framework**: React 18.3 + TypeScript + Vite
- **Estilos**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Estado**: Zustand + React Query
- **Móvil**: Capacitor 6.0 (iOS + Android)
- **Despliegue**: Vercel

## 📦 Características

### Módulos Implementados

- **🛍️ Marketplace**: Compra/venta de productos entre estudiantes
- **📚 Tutorías**: Sistema de tutorías peer-to-peer
- **⚠️ Reportes**: Reportes de seguridad y emergencias
- **🔔 Notificaciones**: Sistema de notificaciones en tiempo real
- **🎟️ Cupones**: Sistema de cupones y descuentos
- **🗺️ Mapas**: Ubicaciones del campus
- **👤 Perfil**: Gestión de perfil de usuario

### Base de Datos

14 tablas principales:
- `users` - Perfiles de usuario
- `products` - Productos del marketplace
- `sales` - Transacciones de venta
- `tutoring_sessions` - Sesiones de tutoría
- `tutoring_bookings` - Reservas de tutorías
- `reports` - Reportes de seguridad
- `notifications` - Notificaciones
- `coupons` - Cupones
- `user_coupons` - Uso de cupones
- `campus_locations` - Ubicaciones del campus
- `messages` - Mensajería
- `favorites` - Favoritos
- `reviews` - Reseñas
- `categories` - Categorías

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/pcarvajalr/uni_app_web.git
cd uni_app_web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Configurar la base de datos en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a SQL Editor
3. Copia y pega el contenido de `database.sql`
4. Ejecuta el script

Esto creará:
- Todas las tablas con sus relaciones
- Row Level Security (RLS) policies
- Triggers automáticos
- Índices optimizados
- Datos iniciales (categorías, ubicaciones, cupón de bienvenida)

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📱 Desarrollo Móvil con Capacitor

### Sincronizar cambios

```bash
npm run build
npm run cap:sync
```

### Abrir proyecto nativo

**Android:**
```bash
npm run cap:android
```

**iOS:**
```bash
npm run cap:ios
```

### Plugins de Capacitor instalados

- Camera
- Geolocation
- Push Notifications
- Preferences (Storage)
- Share
- Filesystem
- Network
- App
- Toast
- Haptics
- Status Bar
- Splash Screen

## 🌐 Despliegue en Vercel

### Método 1: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New Project"
3. Importa el repositorio de GitHub
4. Vercel detectará automáticamente Vite
5. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click en "Deploy"

### Método 2: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Desplegar a producción
vercel --prod
```

### Configurar variables de entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las siguientes variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (URL de tu app en producción)

## 🔧 Scripts disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Ejecutar linter

# Capacitor
npm run cap:sync     # Sincronizar código web con apps nativas
npm run cap:android  # Abrir Android Studio
npm run cap:ios      # Abrir Xcode
```

## 📂 Estructura del Proyecto

```
/
├── src/
│   ├── pages/              # Páginas de la aplicación
│   ├── components/         # Componentes reutilizables
│   ├── services/           # Servicios API (Supabase)
│   ├── lib/                # Utilidades y configuración
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Estado global (Zustand)
│   ├── types/              # Tipos TypeScript
│   ├── capacitor/          # Utilidades de Capacitor
│   ├── styles/             # Estilos globales
│   └── assets/             # Recursos estáticos
├── android/                # Proyecto nativo Android
├── ios/                    # Proyecto nativo iOS
├── public/                 # Archivos públicos
├── database.sql            # Esquema de base de datos
├── vercel.json             # Configuración de Vercel
└── capacitor.config.ts     # Configuración de Capacitor
```

## 🔐 Autenticación

La aplicación usa Supabase Auth con:

- Email + Password
- Sesiones persistentes
- Refresh tokens automáticos
- Row Level Security (RLS) para proteger datos

### Registro de usuario

```typescript
import { useAuth } from './lib/auth';

const { register } = useAuth();
await register(name, email, password);
```

### Inicio de sesión

```typescript
const { login } = useAuth();
await login(email, password);
```

### Cerrar sesión

```typescript
const { logout } = useAuth();
await logout();
```

## 📡 Servicios API

Los servicios están organizados por módulo en `src/services/`:

### Productos (Marketplace)

```typescript
import * as ProductsService from './services/products.service';

// Obtener productos
const products = await ProductsService.getProducts();

// Crear producto
const product = await ProductsService.createProduct({
  seller_id: userId,
  title: 'Laptop',
  description: 'Excelente estado',
  price: 500,
  // ...
});
```

### Tutorías

```typescript
import * as TutoringService from './services/tutoring.service';

// Obtener sesiones
const sessions = await TutoringService.getTutoringSessions();

// Crear reserva
const booking = await TutoringService.createTutoringBooking({
  session_id: sessionId,
  student_id: userId,
  // ...
});
```

### Notificaciones

```typescript
import * as NotificationsService from './services/notifications.service';

// Obtener notificaciones
const notifications = await NotificationsService.getUserNotifications(userId);

// Suscribirse a notificaciones en tiempo real
const unsubscribe = NotificationsService.subscribeToNotifications(
  userId,
  (notification) => {
    console.log('Nueva notificación:', notification);
  }
);
```

## 🎨 Componentes UI

La aplicación usa Radix UI + Tailwind CSS con componentes pre-construidos en `src/components/ui/`:

- Button
- Card
- Dialog
- Toast
- Dropdown
- Select
- Tabs
- Y más...

## 📝 Notas de Desarrollo

### Variables de Entorno

- Las variables que empiezan con `VITE_` son accesibles desde el cliente
- **NUNCA** expongas claves secretas con el prefijo `VITE_`
- Las variables sin prefijo son solo para el backend

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS configuradas:
- Los usuarios solo pueden ver sus propios datos privados
- Los productos públicos son visibles para todos
- Las notificaciones son privadas por usuario

### Capacitor

- Usa `isNative` de `src/capacitor/platform.ts` para detectar plataforma
- Los plugins están disponibles en `src/capacitor/`
- Sincroniza después de cada cambio importante

## 🐛 Troubleshooting

### Error: "Missing environment variables"

Asegúrate de que `.env` existe y tiene las variables correctas con el prefijo `VITE_`.

### Error de CORS en desarrollo

Supabase permite todos los orígenes por defecto. Verifica que las credenciales sean correctas.

### Build falla en Vercel

Verifica que las variables de entorno estén configuradas en el dashboard de Vercel.

### Capacitor no sincroniza

```bash
npm run build
npx cap sync
```

## 📄 Licencia

MIT

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

Hecho con ❤️ para la comunidad universitaria
