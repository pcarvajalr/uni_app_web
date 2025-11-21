import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">UniApp</h1>
          <p className="text-muted-foreground">Restablecer contraseña</p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
