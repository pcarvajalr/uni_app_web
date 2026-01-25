import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import AppIcon from "@/assets/AppIcon_Principal.png";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src={AppIcon}
              alt="BLE"
              className="h-10 w-10 rounded-lg"
            />
            <h1
              className="text-3xl font-extrabold tracking-wide"
              style={{
                background: "linear-gradient(135deg, #2E4A7D 0%, #4A6FA5 50%, #6B8FBF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.15em"
              }}
            >
              BLE
            </h1>
          </div>
          <p className="text-muted-foreground">Restablecer contraseña</p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
