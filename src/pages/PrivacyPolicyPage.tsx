import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
          <p className="text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
            <p className="mb-4">
              Bienvenido a UNI APP. Nos comprometemos a proteger tu privacidad y a ser transparentes sobre cómo recopilamos,
              usamos y protegemos tu información personal. Esta política de privacidad describe nuestras prácticas de manejo
              de datos cuando utilizas nuestra aplicación móvil y web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Información que Recopilamos</h2>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Información de Cuenta</h3>
            <p className="mb-4">
              Cuando te registras en UNI APP, recopilamos:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Nombre completo</li>
              <li>Correo electrónico institucional</li>
              <li>Información de perfil (opcional)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Permisos de Dispositivo</h3>
            <p className="mb-4">
              Nuestra aplicación móvil puede solicitar acceso a las siguientes funciones de tu dispositivo:
            </p>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Cámara</h4>
              <p className="ml-4 mb-3">
                Usamos el acceso a la cámara para permitirte tomar fotos de productos que deseas vender en el marketplace
                o para actualizar tu foto de perfil. Las fotos se procesan localmente y solo se suben a nuestros servidores
                cuando tú lo autorizas explícitamente.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Ubicación</h4>
              <p className="ml-4 mb-3">
                Solicitamos acceso a tu ubicación para mostrarte lugares de interés en el campus universitario, como
                bibliotecas, cafeterías, salones de clase y puntos de encuentro para tutorías. Tu ubicación solo se
                utiliza mientras usas activamente la función de mapas y no se almacena permanentemente.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Almacenamiento (Fotos y Videos)</h4>
              <p className="ml-4 mb-3">
                Accedemos a tu galería de fotos y videos para permitirte seleccionar imágenes existentes al publicar
                productos en el marketplace o actualizar tu perfil. Solo accedemos a las fotos que tú seleccionas
                explícitamente.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Notificaciones Push</h4>
              <p className="ml-4 mb-3">
                Usamos notificaciones push para informarte sobre mensajes nuevos, actualizaciones de tus publicaciones,
                recordatorios de sesiones de tutoría programadas y otras actividades relevantes. Puedes desactivar las
                notificaciones en cualquier momento desde la configuración de tu dispositivo.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cómo Usamos tu Información</h2>
            <p className="mb-4">Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Permitir la funcionalidad del marketplace estudiantil</li>
              <li>Facilitar el sistema de tutorías entre estudiantes</li>
              <li>Enviarte notificaciones importantes sobre tu cuenta y actividades</li>
              <li>Mejorar la experiencia del usuario y la funcionalidad de la aplicación</li>
              <li>Mostrar ubicaciones relevantes en el campus universitario</li>
              <li>Comunicarnos contigo sobre cambios en el servicio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Compartir Información</h2>
            <p className="mb-4">
              No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing.
              Podemos compartir tu información solo en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Con otros usuarios cuando publicas contenido en el marketplace o solicitas/ofreces tutorías</li>
              <li>Cuando sea requerido por ley o para responder a procesos legales</li>
              <li>Para proteger los derechos, propiedad o seguridad de UNI APP y sus usuarios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Seguridad de Datos</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tu información personal
              contra el acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Autenticación segura de usuarios</li>
              <li>Acceso limitado a datos personales solo para personal autorizado</li>
              <li>Monitoreo regular de nuestros sistemas para detectar vulnerabilidades</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Tus Derechos</h2>
            <p className="mb-4">Tienes derecho a:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta o incompleta</li>
              <li>Solicitar la eliminación de tu cuenta y datos asociados</li>
              <li>Revocar permisos otorgados a la aplicación desde la configuración de tu dispositivo</li>
              <li>Desactivar notificaciones push en cualquier momento</li>
              <li>Exportar tus datos en un formato legible</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Retención de Datos</h2>
            <p className="mb-4">
              Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos
              descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.
              Cuando eliminas tu cuenta, procedemos a eliminar o anonimizar tu información personal de forma permanente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Privacidad de Menores</h2>
            <p className="mb-4">
              Nuestra aplicación está dirigida a estudiantes universitarios mayores de 18 años. No recopilamos
              intencionalmente información personal de menores de edad. Si descubrimos que hemos recopilado información
              de un menor, tomaremos medidas para eliminar esa información lo antes posible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cambios a esta Política</h2>
            <p className="mb-4">
              Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre cambios significativos
              publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Te recomendamos
              revisar esta política periódicamente para estar informado sobre cómo protegemos tu información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
            <p className="mb-4">
              Si tienes preguntas o inquietudes sobre esta política de privacidad o nuestras prácticas de datos,
              puedes contactarnos a través de:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Correo electrónico: Dentro de la aplicación en la sección "Ayuda"</li>
              <li>A través de la configuración de tu perfil en la aplicación</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Consentimiento</h2>
            <p className="mb-4">
              Al usar UNI APP, aceptas los términos de esta política de privacidad. Si no estás de acuerdo con esta
              política, por favor no uses nuestra aplicación.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
