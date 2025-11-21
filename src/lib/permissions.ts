import { useAuth } from './auth';

/**
 * Hook para verificar permisos de administrador
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

/**
 * Hook para verificar si el usuario es un usuario normal
 */
export const useIsUser = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'user';
};

/**
 * Función helper para verificar si un usuario es admin
 * @param userRole - El rol del usuario
 * @returns boolean
 */
export const isAdmin = (userRole?: 'user' | 'admin'): boolean => {
  return userRole === 'admin';
};

/**
 * Función helper para verificar si un usuario es usuario normal
 * @param userRole - El rol del usuario
 * @returns boolean
 */
export const isUser = (userRole?: 'user' | 'admin'): boolean => {
  return userRole === 'user';
};

/**
 * Lista de permisos que solo los administradores pueden realizar
 */
export const ADMIN_PERMISSIONS = {
  // Gestión de reportes
  UPDATE_ANY_REPORT: 'update_any_report',
  DELETE_ANY_REPORT: 'delete_any_report',
  ASSIGN_REPORTS: 'assign_reports',

  // Gestión de cupones
  CREATE_COUPONS: 'create_coupons',
  UPDATE_COUPONS: 'update_coupons',
  DELETE_COUPONS: 'delete_coupons',
  VIEW_ALL_COUPONS: 'view_all_coupons',

  // Gestión de categorías
  CREATE_CATEGORIES: 'create_categories',
  UPDATE_CATEGORIES: 'update_categories',
  DELETE_CATEGORIES: 'delete_categories',

  // Gestión de ubicaciones del campus
  CREATE_LOCATIONS: 'create_locations',
  UPDATE_LOCATIONS: 'update_locations',
  DELETE_LOCATIONS: 'delete_locations',

  // Gestión de notificaciones
  CREATE_GLOBAL_NOTIFICATIONS: 'create_global_notifications',
  VIEW_ALL_NOTIFICATIONS: 'view_all_notifications',

  // Gestión de usuarios
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_USER_DETAILS: 'view_user_details',

  // Estadísticas y análisis
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
} as const;

/**
 * Verifica si el usuario tiene un permiso específico
 * @param userRole - El rol del usuario
 * @param permission - El permiso a verificar
 * @returns boolean
 */
export const hasPermission = (
  userRole?: 'user' | 'admin',
  permission?: string
): boolean => {
  // Solo los admins tienen permisos especiales
  if (userRole !== 'admin') {
    return false;
  }

  // Los admins tienen todos los permisos
  return true;
};

/**
 * Lista de funcionalidades restringidas para usuarios normales
 */
export const RESTRICTED_FOR_USERS = {
  // Reportes - solo pueden crear y ver sus propios reportes
  UPDATE_OTHERS_REPORTS: true,
  DELETE_OTHERS_REPORTS: true,
  ASSIGN_REPORTS: true,
  CHANGE_REPORT_STATUS: true,

  // Cupones - solo pueden ver y usar cupones activos
  CREATE_COUPONS: true,
  EDIT_COUPONS: true,
  DELETE_COUPONS: true,

  // Categorías - solo lectura
  MANAGE_CATEGORIES: true,

  // Ubicaciones - solo lectura
  MANAGE_LOCATIONS: true,

  // Notificaciones - solo pueden ver las suyas
  CREATE_NOTIFICATIONS_FOR_OTHERS: true,
  VIEW_ALL_NOTIFICATIONS: true,
} as const;

/**
 * Hook para verificar si una funcionalidad está restringida para el usuario actual
 */
export const useIsRestricted = (feature: keyof typeof RESTRICTED_FOR_USERS): boolean => {
  const { user } = useAuth();

  // Los admins no tienen restricciones
  if (user?.role === 'admin') {
    return false;
  }

  // Los usuarios normales tienen restricciones
  return RESTRICTED_FOR_USERS[feature] === true;
};

/**
 * Componente HOC para proteger rutas o componentes que requieren rol de admin
 */
export const RequireAdmin: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const isAdminUser = useIsAdmin();

  if (!isAdminUser) {
    return fallback as React.ReactElement;
  }

  return children as React.ReactElement;
};

/**
 * Función para obtener el nombre legible del rol
 */
export const getRoleName = (role?: 'user' | 'admin'): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'user':
      return 'Usuario';
    default:
      return 'Sin rol';
  }
};

/**
 * Función para obtener el color del badge según el rol
 */
export const getRoleColor = (role?: 'user' | 'admin'): string => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'user':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
