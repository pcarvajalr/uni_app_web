import { Mail, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmailVerificationNoticeProps {
  email?: string;
}

/**
 * Componente que muestra un aviso de verificación de email pendiente
 */
export function EmailVerificationNotice({ email }: EmailVerificationNoticeProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Mail className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl font-bold text-orange-900">
          Verifica tu email
        </CardTitle>
        <CardDescription className="text-orange-700">
          Te hemos enviado un correo de confirmación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-orange-800">
          <p>
            Para completar tu registro y acceder a la aplicación, debes verificar tu dirección de email.
          </p>
          {email && (
            <p className="font-medium">
              Hemos enviado un enlace de verificación a:{' '}
              <span className="text-orange-900">{email}</span>
            </p>
          )}
          <div className="mt-4 rounded-md bg-white p-3 space-y-2">
            <p className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Instrucciones:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Revisa tu bandeja de entrada</li>
              <li>Abre el email de verificación</li>
              <li>Haz clic en el enlace de confirmación</li>
              <li>Regresa aquí para iniciar sesión</li>
            </ol>
          </div>
          <p className="text-xs mt-4">
            <strong>Nota:</strong> Si no ves el email, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
