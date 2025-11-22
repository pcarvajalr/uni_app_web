import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { calculatePasswordStrength, validatePasswordRequirements } from '@/lib/password-validation';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const requirements = useMemo(() => validatePasswordRequirements(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Barra de fortaleza */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Fortaleza de la contraseña</span>
          <span className={cn('font-medium', {
            'text-red-500': strength.score <= 2,
            'text-yellow-500': strength.score === 3,
            'text-blue-500': strength.score === 4,
            'text-green-500': strength.score === 5,
          })}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                level <= strength.score ? strength.color : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requisitos de contraseña */}
      {showRequirements && (
        <div className="space-y-1 text-xs">
          <RequirementItem
            met={requirements.minLength}
            text="Mínimo 8 caracteres"
          />
          <RequirementItem
            met={requirements.hasLowercase}
            text="Al menos una letra minúscula"
          />
          <RequirementItem
            met={requirements.hasUppercase}
            text="Al menos una letra mayúscula"
          />
          <RequirementItem
            met={requirements.hasNumber}
            text="Al menos un número"
          />
          <RequirementItem
            met={requirements.hasSpecialChar}
            text="Al menos un carácter especial (!@#$%^&*, etc.)"
          />
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <X className="h-3 w-3 text-gray-400" />
      )}
      <span className={cn(
        met ? 'text-green-600' : 'text-muted-foreground'
      )}>
        {text}
      </span>
    </div>
  );
}
