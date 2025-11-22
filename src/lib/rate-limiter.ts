/**
 * Rate limiter para prevenir ataques de fuerza bruta en login
 */

interface LoginAttempt {
  count: number;
  lockUntil: number | null;
}

const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Obtiene los intentos de login almacenados en localStorage
 */
function getLoginAttempts(email: string): LoginAttempt {
  try {
    const stored = localStorage.getItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error al leer intentos de login:', error);
  }
  return { count: 0, lockUntil: null };
}

/**
 * Guarda los intentos de login en localStorage
 */
function saveLoginAttempts(email: string, attempts: LoginAttempt): void {
  try {
    localStorage.setItem(`${LOGIN_ATTEMPTS_KEY}_${email}`, JSON.stringify(attempts));
  } catch (error) {
    console.error('Error al guardar intentos de login:', error);
  }
}

/**
 * Registra un intento de login fallido
 */
export function recordFailedLogin(email: string): void {
  const attempts = getLoginAttempts(email);
  attempts.count += 1;

  // Si alcanzó el máximo de intentos, bloquear la cuenta temporalmente
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockUntil = Date.now() + LOCK_DURATION;
  }

  saveLoginAttempts(email, attempts);
}

/**
 * Resetea los intentos de login después de un login exitoso
 */
export function resetLoginAttempts(email: string): void {
  try {
    localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}_${email}`);
  } catch (error) {
    console.error('Error al resetear intentos de login:', error);
  }
}

/**
 * Verifica si el usuario está bloqueado temporalmente
 * @returns Objeto con estado de bloqueo y tiempo restante en minutos
 */
export function checkLoginLock(email: string): {
  isLocked: boolean;
  remainingTime: number; // en minutos
  attemptsRemaining: number;
} {
  const attempts = getLoginAttempts(email);

  // Si hay un bloqueo activo
  if (attempts.lockUntil && attempts.lockUntil > Date.now()) {
    const remainingMs = attempts.lockUntil - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return {
      isLocked: true,
      remainingTime: remainingMinutes,
      attemptsRemaining: 0,
    };
  }

  // Si el bloqueo expiró, resetear
  if (attempts.lockUntil && attempts.lockUntil <= Date.now()) {
    resetLoginAttempts(email);
    return {
      isLocked: false,
      remainingTime: 0,
      attemptsRemaining: MAX_ATTEMPTS,
    };
  }

  // No está bloqueado
  return {
    isLocked: false,
    remainingTime: 0,
    attemptsRemaining: MAX_ATTEMPTS - attempts.count,
  };
}

/**
 * Obtiene el número de intentos fallidos
 */
export function getFailedAttempts(email: string): number {
  const attempts = getLoginAttempts(email);
  return attempts.count;
}
