import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Clock, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteAccount } from "@/services/users.service";
import { Loader2 } from "lucide-react";

export default function AccountDeletionPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const result = await deleteAccount(user.id);

      if (result.success) {
        toast({
          title: "Cuenta eliminada",
          description: `Tu cuenta ha sido marcada para eliminación. Tienes hasta el ${new Date(result.recovery_deadline!).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} para recuperarla.`,
          variant: "destructive",
        });

        // Logout and redirect
        await logout();
        navigate('/auth');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={user ? "/settings" : "/"}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Eliminación de Cuenta - UNI APP</h1>
            <p className="text-muted-foreground">
              Información sobre cómo eliminar tu cuenta y qué sucede con tus datos
            </p>
          </div>

          {/* Grace Period Alert */}
          <Alert className="mb-8 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <Clock className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Periodo de Gracia de 30 Días:</strong> Después de solicitar la eliminación,
              tendrás 30 días para recuperar tu cuenta iniciando sesión. Después de ese periodo,
              la eliminación será permanente e irreversible.
            </AlertDescription>
          </Alert>

          {/* Steps Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Cómo Eliminar tu Cuenta
            </h2>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <ol className="list-decimal pl-6 space-y-4">
                  <li className="text-base">
                    <strong>Inicia sesión</strong> en tu cuenta de UNI APP (si no lo has hecho ya)
                  </li>
                  <li className="text-base">
                    <strong>Ve a Configuración</strong> desde el menú principal de la aplicación
                  </li>
                  <li className="text-base">
                    <strong>Busca la sección</strong> "Gestión de Datos"
                  </li>
                  <li className="text-base">
                    <strong>Haz clic en "Eliminar cuenta"</strong> y confirma tu decisión
                  </li>
                  <li className="text-base">
                    <strong>Tu cuenta será anonimizada</strong> inmediatamente y marcada para eliminación permanente en 30 días
                  </li>
                </ol>

                {user && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Ya que has iniciado sesión, puedes eliminar tu cuenta directamente desde aquí:
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Eliminar mi cuenta ahora
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!user && (
                  <div className="mt-6 pt-6 border-t">
                    <Alert>
                      <AlertDescription>
                        <strong>¿No has iniciado sesión?</strong> Necesitas estar autenticado para eliminar tu cuenta.
                        <Link to="/auth" className="block mt-2">
                          <Button variant="outline" className="w-full">
                            Iniciar Sesión
                          </Button>
                        </Link>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Data Deletion Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Datos que se Eliminan</h2>

            <Card className="mb-4 border-red-200 dark:border-red-900">
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Los siguientes datos serán <strong>eliminados o anonimizados inmediatamente</strong> al solicitar la eliminación de tu cuenta:
                </p>
                <ul className="space-y-2">
                  {[
                    'Nombre completo',
                    'Correo electrónico (reemplazado por identificador anónimo)',
                    'Número de teléfono',
                    'Matrícula estudiantil',
                    'Carrera y semestre',
                    'Biografía personal',
                    'Foto de perfil',
                    'Todas las notificaciones',
                    'Ubicaciones y productos favoritos',
                    'Cupones obtenidos o canjeados'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Data Retention Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Datos que se Conservan (Anonimizados)</h2>

            <Card className="mb-4 border-blue-200 dark:border-blue-900">
              <CardContent className="pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Los siguientes datos se <strong>conservan de forma anonimizada</strong> por razones legales,
                  contables o para proteger la integridad del marketplace:
                </p>
                <ul className="space-y-3">
                  <li className="text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Historial de transacciones y ventas</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Conservado por 7 años según requisitos fiscales y legales. Aparecerás como "Usuario Eliminado".
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Productos publicados</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Marcados como eliminados pero conservados para historial de transacciones.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Sesiones de tutoría completadas</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Conservadas para registros académicos y calificaciones de otros usuarios.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Reseñas y calificaciones</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Las reseñas que escribiste se conservan de forma anónima para proteger a otros usuarios.
                          Las reseñas sobre ti también se mantienen.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Reportes de seguridad</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Conservados de forma anonimizada para investigaciones y auditorías de seguridad.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Mensajes en conversaciones</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tus mensajes se marcan como "[Mensaje de usuario eliminado]" pero se conservan
                          para el historial del otro participante de la conversación.
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Retention Period */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Periodo de Retención Adicional</h2>

            <Alert className="border-orange-500">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-orange-800 dark:text-orange-200">
                    Periodo de Gracia: 30 días
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Durante los 30 días posteriores a la solicitud de eliminación, puedes recuperar
                    tu cuenta simplemente iniciando sesión nuevamente. Tus productos se restaurarán
                    automáticamente al estado "disponible".
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>Importante:</strong> Después de 30 días, la eliminación es permanente e irreversible.
                    No podremos recuperar tu información personal ni tus datos de cuenta.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </section>

          {/* FAQ Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Preguntas Frecuentes</h2>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Puedo recuperar mi cuenta después de eliminarla?</AccordionTrigger>
                <AccordionContent>
                  Sí, durante los primeros 30 días después de solicitar la eliminación, puedes recuperar
                  tu cuenta simplemente iniciando sesión con tus credenciales originales. Tu perfil y
                  productos se restaurarán automáticamente. Después de 30 días, la eliminación es permanente.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Qué pasa con los productos que tengo publicados?</AccordionTrigger>
                <AccordionContent>
                  Tus productos se marcarán como "eliminados" y ya no serán visibles en el marketplace.
                  Sin embargo, se conservan en nuestro sistema para mantener el historial de transacciones.
                  Si recuperas tu cuenta dentro de los 30 días, tus productos volverán a estar disponibles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Se eliminarán mis mensajes con otros usuarios?</AccordionTrigger>
                <AccordionContent>
                  Tus mensajes se marcarán como "[Mensaje de usuario eliminado]" pero se conservarán
                  en las conversaciones para que el otro participante mantenga el contexto de su historial.
                  Esto protege la experiencia de los demás usuarios mientras preserva tu privacidad.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Cuánto tiempo toma el proceso de eliminación?</AccordionTrigger>
                <AccordionContent>
                  La anonimización de tus datos personales es <strong>inmediata</strong>. En cuanto confirmes
                  la eliminación, tu nombre, email, teléfono y otra información personal se reemplazarán por
                  datos anónimos. La eliminación permanente ocurre automáticamente después de 30 días.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Por qué se conservan algunos datos?</AccordionTrigger>
                <AccordionContent>
                  Algunos datos se conservan por:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Requisitos legales:</strong> Las transacciones financieras deben conservarse 7 años según regulaciones fiscales</li>
                    <li><strong>Protección de otros usuarios:</strong> Las reseñas y calificaciones ayudan a mantener la confianza en la plataforma</li>
                    <li><strong>Integridad del sistema:</strong> Los reportes de seguridad se usan para investigaciones y auditorías</li>
                  </ul>
                  <p className="mt-2">Todos estos datos se anonimizan para proteger tu privacidad.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>¿Puedo crear una nueva cuenta con el mismo email después?</AccordionTrigger>
                <AccordionContent>
                  Después de que tu cuenta sea permanentemente eliminada (30 días después de la solicitud),
                  sí podrás crear una nueva cuenta usando el mismo email. Sin embargo, será una cuenta
                  completamente nueva sin ningún dato de tu cuenta anterior.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Contact Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">¿Necesitas Ayuda?</h2>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm mb-4">
                  Si tienes preguntas sobre la eliminación de tu cuenta o necesitas asistencia,
                  puedes contactarnos:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Desde la aplicación: Ve a la sección "Ayuda" en el menú
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Desde tu perfil: Usa la opción "Soporte" en la configuración
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Developer Info */}
          <section className="mb-8">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">
                  <strong>Desarrollado por:</strong> UNI APP Team<br />
                  <strong>Aplicación:</strong> UNI APP - Plataforma Estudiantil<br />
                  <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Estás completamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Esta acción eliminará toda tu información personal de forma inmediata y marcará
                tu cuenta para eliminación permanente en 30 días.
              </p>
              <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <p className="text-sm font-semibold text-destructive mb-2">Se eliminarán:</p>
                <ul className="text-xs space-y-1 text-destructive/90">
                  <li>• Tu nombre, email y teléfono</li>
                  <li>• Información académica (carrera, semestre)</li>
                  <li>• Todas tus notificaciones y favoritos</li>
                  <li>• Cupones obtenidos</li>
                </ul>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-md border border-orange-200 dark:border-orange-900">
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                  ⏰ Periodo de Gracia: 30 días
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Podrás recuperar tu cuenta iniciando sesión antes del plazo.
                  Después de 30 días, la eliminación será <strong>permanente e irreversible</strong>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Sí, eliminar mi cuenta'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
