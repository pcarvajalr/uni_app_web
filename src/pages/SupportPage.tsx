import { ArrowLeft, Mail, MessageCircle, FileQuestion, Shield, Trash2, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Centro de Soporte</h1>
          <p className="text-muted-foreground">
            Estamos aquí para ayudarte. Encuentra respuestas a las preguntas más frecuentes o contáctanos.
          </p>
        </div>

        {/* Sección de Contacto */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contáctanos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Correo Electrónico
                </CardTitle>
                <CardDescription>
                  Envíanos un correo y te responderemos en 24-48 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:uniapp.col@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  uniapp.col@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Soporte en la App
                </CardTitle>
                <CardDescription>
                  Accede al sistema de ayuda dentro de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ve a tu perfil → Configuración → Ayuda
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Preguntas Frecuentes
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué es UNI APP?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  UNI APP es una plataforma integral para estudiantes universitarios que incluye un marketplace
                  para comprar y vender artículos, un sistema de tutorías entre estudiantes, mapas del campus,
                  reportes de incidencias y cupones de descuentos exclusivos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo me registro en la aplicación?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Para registrarte, descarga la aplicación desde la App Store o Google Play, haz clic en
                  "Registrarse" y completa el formulario con tu correo electrónico institucional. Recibirás
                  un correo de verificación para activar tu cuenta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo publico un producto en el marketplace?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ve a la sección "Marketplace", haz clic en el botón "+" para crear una nueva publicación,
                  completa la información del producto, sube fotos y establece el precio. Tu publicación
                  estará visible para otros estudiantes inmediatamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo ofrezco o solicito tutorías?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  En la sección "Tutorías" puedes crear una publicación indicando si ofreces o buscas
                  tutoría. Especifica la materia, tu disponibilidad y cualquier detalle relevante. Otros
                  estudiantes podrán contactarte a través de la aplicación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Es segura mi información personal?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sí, tomamos muy en serio la seguridad de tus datos. Utilizamos cifrado de extremo a extremo,
                  autenticación segura y seguimos las mejores prácticas de la industria. Lee nuestra{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    Política de Privacidad
                  </Link>{" "}
                  para más detalles.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo reporto un problema o contenido inapropiado?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  En la sección "Reportes" puedes reportar incidencias en el campus, contenido inapropiado
                  o problemas técnicos. Nuestro equipo revisará tu reporte y tomará las medidas necesarias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué permisos necesita la aplicación y por qué?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Cámara:</p>
                    <p>Para tomar fotos de productos y actualizar tu foto de perfil.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ubicación:</p>
                    <p>Para mostrarte lugares relevantes en el campus universitario.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Almacenamiento:</p>
                    <p>Para seleccionar fotos de tu galería al publicar productos.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Notificaciones:</p>
                    <p>Para informarte sobre mensajes, actualizaciones y recordatorios importantes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo elimino mi cuenta?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Puedes solicitar la eliminación de tu cuenta desde la configuración de tu perfil o
                  visitando nuestra página de{" "}
                  <Link to="/account-deletion" className="text-primary hover:underline">
                    Eliminación de Cuenta
                  </Link>
                  . Ten en cuenta que esta acción es permanente y no se puede deshacer.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enlaces Rápidos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Enlaces Útiles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/privacy-policy">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-5 w-5" />
                    Política de Privacidad
                  </CardTitle>
                  <CardDescription>
                    Conoce cómo protegemos tus datos
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/account-deletion">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trash2 className="h-5 w-5" />
                    Eliminación de Cuenta
                  </CardTitle>
                  <CardDescription>
                    Solicita eliminar tu cuenta
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/help">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileQuestion className="h-5 w-5" />
                    Centro de Ayuda
                  </CardTitle>
                  <CardDescription>
                    Guías y tutoriales
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>

        {/* Información de la App */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sobre UNI APP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Versión:</strong> 1.0.0
              </p>
              <p>
                <strong className="text-foreground">Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p>
                <strong className="text-foreground">Compatibilidad:</strong> iOS 13.0+ / Android 8.0+
              </p>
              <p className="mt-4">
                UNI APP es desarrollada y mantenida con el objetivo de mejorar la experiencia
                universitaria de los estudiantes, facilitando la comunicación, el comercio y la
                colaboración dentro del campus.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
