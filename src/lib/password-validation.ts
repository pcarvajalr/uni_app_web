import { z } from 'zod';

/**
 * Esquema de validación de contraseña fuerte
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'Debe contener al menos un carácter especial (!@#$%^&*, etc.)');

/**
 * Calcula la fortaleza de una contraseña
 * @param password - La contraseña a evaluar
 * @returns Objeto con score (0-5) y mensaje de fortaleza
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (!password) {
    return { score: 0, label: '', color: 'bg-gray-200' };
  }

  // Longitud
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complejidad
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Normalizar a máximo 5
  score = Math.min(score, 5);

  // Determinar etiqueta y color
  let label = '';
  let color = '';

  switch (score) {
    case 0:
    case 1:
      label = 'Muy débil';
      color = 'bg-red-500';
      break;
    case 2:
      label = 'Débil';
      color = 'bg-orange-500';
      break;
    case 3:
      label = 'Aceptable';
      color = 'bg-yellow-500';
      break;
    case 4:
      label = 'Fuerte';
      color = 'bg-blue-500';
      break;
    case 5:
      label = 'Muy fuerte';
      color = 'bg-green-500';
      break;
  }

  return { score, label, color };
}

/**
 * Valida los requisitos individuales de la contraseña
 * @param password - La contraseña a validar
 * @returns Objeto con el estado de cada requisito
 */
export function validatePasswordRequirements(password: string) {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
  };
}
