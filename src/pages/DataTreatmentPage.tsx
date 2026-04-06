import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DataTreatmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleBack = () => {
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS PERSONALES</h1>
          <h2 className="text-xl font-semibold mb-2 mt-0">DENTRO DE LA APLICACIÓN KBLE</h2>
          <p className="text-muted-foreground mb-8">Última actualización: 30 de marzo de 2026</p>

          <p className="mb-4">
            En cumplimiento de lo dispuesto en la Ley 1581 de 2012, el Decreto 1377 de 2013 y las demás normas concordantes, Sebastian Klopstock García, identificado con CC 1.1125.578.439, teléfono 3228698549, domicilio en la ciudad de Bogotá, y correo electrónico uniapp.col@gmail.com, en adelante "KBLE", adopta la presente Política de Privacidad y Tratamiento de Datos Personales, mediante la cual se establecen los lineamientos para la recolección, almacenamiento, uso, circulación, transmisión, transferencia y supresión de los datos personales. El tratamiento específico que se dará a los datos personales, en el contexto de la aplicación móvil, será el definido en el numeral 4 de este documento que se denomina 4. FINALIDADES DEL TRATAMIENTO.
          </p>

          {/* 1. DEFINICIONES */}
          <h2 className="text-2xl font-semibold mb-4">1. DEFINICIONES</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Dato personal:</strong> Información que se asocia o vincula a una persona natural.</li>
            <li><strong>Titular:</strong> Persona natural cuyos datos son tratados.</li>
            <li><strong>Tratamiento:</strong> Se refiere a la recolección de las operaciones sobre los datos personales, su uso, almacenamiento, circulación o supresión.</li>
            <li><strong>Responsable de los datos que se recolectan:</strong> KBLE.</li>
            <li><strong>Encargado de los datos que se recolectan:</strong> KBLE.</li>
            <li><strong>Transferencia:</strong> Esta ocurre cuando el Responsable del tratamiento de datos comunican o envían los datos a un receptor que, a su vez, ostenta la calidad de responsable del tratamiento. Esta puede ser en el territorio nacional o fuera de él.</li>
            <li><strong>Autorización:</strong> Para el tratamiento de datos personales se refiere al consentimiento informado del titular para llevar a cabo el tratamiento de sus datos personales.</li>
          </ul>

          {/* 2. OBJETIVO */}
          <h2 className="text-2xl font-semibold mb-4">2. OBJETIVO</h2>
          <p className="mb-4">
            El objetivo de la presente Política de Privacidad y Tratamiento de Datos Personales es establecer de manera clara, transparente y diferenciada las reglas aplicables al tratamiento de los datos personales recolectados y administrados a través de la plataforma digital KBLE, en su calidad de plataforma de intermediación digital, así como informar a los titulares sobre:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>qué datos personales se recolectan,</li>
            <li>con qué finalidades específicas,</li>
            <li>a quiénes pueden ser compartidos,</li>
            <li>quién ostenta la calidad de responsable o encargado del tratamiento en cada relación jurídica, de conformidad con la normativa vigente en materia de protección de datos personales.</li>
          </ul>
          <p className="mb-4">
            KBLE actúa exclusivamente como responsable del tratamiento de los datos personales que recolecta directamente para la operación, administración y funcionamiento de la plataforma, y no presta servicios de tutoría, no vende productos ni servicios, ni actúa como proveedor directo, sino que facilita el contacto y la interacción entre los distintos actores que participan en la plataforma.
          </p>
          <p className="mb-4">
            La política se estructura por perfiles de usuarios, atendiendo a la naturaleza de los datos suministrados y a las finalidades específicas del tratamiento, a saber:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Usuarios Finales,</strong> titulares de los datos personales, cuyos datos son tratados por KBLE para fines de registro, autenticación, uso de la aplicación, geolocalización, comunicaciones, acceso a promociones y funcionamiento general de la plataforma.</li>
            <li><strong>Tutores,</strong> quienes actúan como usuarios de la plataforma y, a su vez, como proveedores de servicios independientes. KBLE es responsable del tratamiento de los datos necesarios para su registro, perfil público, publicación de servicios, calificaciones, gestión de pagos y comunicaciones dentro de la plataforma. No obstante, cada tutor será responsable del tratamiento de los datos personales que reciba directamente de los usuarios finales por fuera de la plataforma, conforme a sus propias políticas y obligaciones legales.</li>
            <li><strong>Restaurantes y Negocios,</strong> quienes actúan como anunciantes o proveedores de promociones. KBLE es responsable del tratamiento de los datos necesarios para su vinculación, validación de identidad, publicación de promociones, métricas y gestión de pagos dentro de la plataforma. Sin embargo, cada comercio será responsable del tratamiento de los datos personales que reciba directamente de los usuarios finales cuando estos rediman promociones, cupones o establezcan contacto directo, por fuera del entorno controlado por KBLE.</li>
          </ul>
          <p className="mb-4">
            La presente política tiene como finalidad delimitar expresamente las responsabilidades de KBLE frente a los tratamientos que se realizan dentro de la plataforma, así como excluir cualquier responsabilidad por los tratamientos posteriores, autónomos o independientes que realicen tutores o comercios, en su calidad de responsables directos de dicha información.
          </p>

          {/* 2. ÁMBITO DE APLICACIÓN */}
          <h2 className="text-2xl font-semibold mb-4">2. ÁMBITO DE APLICACIÓN</h2>
          <p className="mb-4">Aplica a todas las bases de datos custodiadas y recolectadas por KBLE a través de:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>la app</li>
            <li>formularios</li>
            <li>registros</li>
            <li>convenios</li>
            <li>marketplace</li>
            <li>tutorías</li>
            <li>campañas</li>
            <li>soporte</li>
          </ul>
          <p className="mb-4">
            KBLE realiza el tratamiento de datos bajo los principios de legalidad, finalidad, libertad, veracidad, seguridad y confidencialidad.
          </p>

          {/* 3. DATOS QUE SE RECOLECTAN */}
          <h2 className="text-2xl font-semibold mb-4">3. DATOS QUE SE RECOLECTAN</h2>
          <p className="mb-4">KBLE podrá recolectar:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>nombre</li>
            <li>correo</li>
            <li>teléfono</li>
            <li>universidad</li>
            <li>ubicación aproximada</li>
            <li>historial de uso</li>
            <li>preferencias</li>
            <li>datos de contacto</li>
            <li>datos de comercio</li>
            <li>imágenes</li>
            <li>contenido publicado</li>
            <li>datos de pago (a través de pasarela)</li>
          </ul>

          {/* 4. FINALIDADES DEL TRATAMIENTO */}
          <h2 className="text-2xl font-semibold mb-4">4. FINALIDADES DEL TRATAMIENTO</h2>
          <p className="mb-4">
            Los datos personales recolectados en la plataforma KBLE serán tratados conforme a la base de datos a la que pertenezcan, con las siguientes finalidades y operaciones:
          </p>

          {/* 4.1 Base de datos de usuarios inscritos */}
          <h3 className="text-xl font-semibold mb-3 mt-6">1. Base de datos de usuarios inscritos</h3>
          <p className="mb-2 font-semibold">Finalidades:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Crear y mantener cuentas de usuario.</strong> Permite registrar a los usuarios en la plataforma y mantener actualizada su información de contacto y perfil.</li>
            <li><strong>Operar la plataforma y habilitar funcionalidades del marketplace.</strong> Facilita la conexión entre usuarios, tutores y comercios, y asegura el funcionamiento de las distintas secciones de la app.</li>
            <li><strong>Validar usuarios y gestionar cupones/promociones.</strong> Verifica la identidad de los usuarios y gestiona el acceso a descuentos, promociones y servicios dentro de la plataforma.</li>
            <li><strong>Conectar con tutores y comercios.</strong> Permite que los usuarios encuentren, contacten y contraten servicios de tutores o accedan a productos y promociones de comercios.</li>
            <li><strong>Enviar notificaciones y comunicaciones.</strong> Incluye mensajes de servicio, alertas importantes, actualizaciones de la app y recordatorios de promociones.</li>
            <li><strong>Marketing propio y promociones.</strong> Difusión de ofertas, contenidos y promociones relacionadas con los servicios disponibles en la plataforma, exclusivamente por KBLE.</li>
            <li><strong>Generar métricas y análisis estadísticos.</strong> Mejora la experiencia del usuario y optimiza la operación de la plataforma mediante análisis agregados y anonimizados de datos.</li>
            <li><strong>Brindar soporte y atención al cliente.</strong> Gestiona solicitudes, consultas, peticiones y reclamos de los usuarios de la plataforma.</li>
            <li><strong>Seguridad y prevención de fraude.</strong> Protege la integridad de la plataforma, evita accesos no autorizados y previene conductas fraudulentas.</li>
            <li><strong>Cumplimiento legal y facturación.</strong></li>
          </ul>
          <p className="mb-2 font-semibold">Operaciones sobre los datos:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Recolección:</strong> Captura de información de registro, contacto, ubicación y preferencias.</li>
            <li><strong>Almacenamiento:</strong> Conservación segura de los datos para permitir la operación continua de la app.</li>
            <li><strong>Uso:</strong> Acceso interno por el personal autorizado para habilitar servicios, notificaciones, soporte y análisis.</li>
            <li><strong>Circulación:</strong> Compartición limitada dentro de la plataforma con tutores y comercios para la contratación de servicios o redención de promociones.</li>
            <li><strong>Actualización/rectificación:</strong> Permite a los usuarios modificar su perfil y preferencias.</li>
            <li><strong>Supresión:</strong> Eliminación de datos cuando el usuario solicite cierre de cuenta o se cumpla la finalidad del tratamiento.</li>
          </ul>
          <p className="mb-4 text-sm italic">
            Nota: Los datos que el usuario comparta directamente con tutores o comercios fuera de la plataforma son tratados únicamente por estos responsables, no por KBLE.
          </p>

          {/* 4.2 Base de datos de tutores */}
          <h3 className="text-xl font-semibold mb-3 mt-6">2. Base de datos de tutores</h3>
          <p className="mb-2 font-semibold">Finalidades:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Registro y mantenimiento de perfil público para que los usuarios conozcan y seleccionen los servicios ofrecidos.</li>
            <li>Publicación de servicios y disponibilidad dentro de la plataforma.</li>
            <li>Gestión de calificaciones y comentarios de los usuarios.</li>
            <li>Procesamiento de pagos y cobros por servicios contratados a través de la app.</li>
            <li>Comunicación con usuarios mediante mensajes y notificaciones.</li>
            <li>Soporte y seguridad dentro de la plataforma.</li>
          </ul>
          <p className="mb-2 font-semibold">Operaciones sobre los datos:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Recolección:</strong> Información de identidad, contacto, perfil profesional y métodos de pago.</li>
            <li><strong>Almacenamiento:</strong> Conservación de datos para visibilidad de servicios y gestión de pagos.</li>
            <li><strong>Uso:</strong> Acceso por KBLE para habilitar la interacción con usuarios y soporte técnico.</li>
            <li><strong>Circulación:</strong> Compartición limitada con usuarios finales para la contratación de servicios.</li>
            <li><strong>Actualización/rectificación:</strong> Los tutores pueden modificar su perfil y disponibilidad.</li>
            <li><strong>Supresión:</strong> Eliminación al terminar la relación con la plataforma o a solicitud del tutor.</li>
          </ul>
          <p className="mb-4 text-sm italic">
            Nota: Los tutores son responsables directos del tratamiento de los datos que reciban de los usuarios fuera de la plataforma (contacto directo, pagos u otra información), conforme a sus propias políticas y obligaciones legales.
          </p>

          {/* 4.3 Base de datos de restaurantes y comercios */}
          <h3 className="text-xl font-semibold mb-3 mt-6">3. Base de datos de restaurantes y comercios</h3>
          <p className="mb-2 font-semibold">Finalidades:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Registro y validación de identidad de los comercios.</li>
            <li>Publicación de promociones y productos.</li>
            <li>Gestión de métricas y análisis de interacción.</li>
            <li>Procesamiento de pagos y facturación relacionados con promociones y servicios dentro de la app.</li>
            <li>Comunicación con usuarios sobre redención de productos o promociones.</li>
            <li>Soporte y seguridad de la información dentro de la plataforma.</li>
          </ul>
          <p className="mb-2 font-semibold">Operaciones sobre los datos:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Recolección:</strong> Información de registro, identidad, contacto y bancarios.</li>
            <li><strong>Almacenamiento:</strong> Conservación para gestión de promociones y análisis de métricas.</li>
            <li><strong>Uso:</strong> Acceso por KBLE para habilitar publicaciones, métricas y procesamiento de pagos dentro de la app.</li>
            <li><strong>Circulación:</strong> Compartición limitada con usuarios finales para redención de promociones dentro de la plataforma.</li>
            <li><strong>Actualización/rectificación:</strong> Los comercios pueden modificar perfil, promociones y datos de contacto.</li>
            <li><strong>Supresión:</strong> Eliminación al finalizar la relación con la plataforma o a solicitud del comercio.</li>
          </ul>
          <p className="mb-4 text-sm italic">
            Nota: Cada comercio es responsable directo del tratamiento de los datos que reciba de los usuarios fuera de la plataforma (redención de cupones, contacto directo, pagos), sin que KBLE asuma corresponsabilidad.
          </p>

          {/* 4.4 Base de datos de proveedores y contratistas */}
          <h3 className="text-xl font-semibold mb-3 mt-6">4. Base de datos de proveedores y contratistas</h3>
          <p className="mb-2 font-semibold">Finalidades:</p>
          <p className="mb-2">Los datos personales recolectados de proveedores y contratistas serán tratados por KBLE con las siguientes finalidades:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Contacto para cotizaciones y prestación de servicios.</strong> Permite comunicarse con los proveedores o contratistas para solicitar presupuestos, coordinar la entrega de servicios o productos.</li>
            <li><strong>Gestión de pagos y facturación.</strong> Facilita el procesamiento de pagos, comprobantes fiscales y cumplimiento de obligaciones contables y tributarias.</li>
            <li><strong>Gestión de cumplimiento contractual y seguimiento de servicios.</strong> Permite verificar que los proveedores o contratistas cumplan con los términos acordados y realizar seguimiento a la prestación de los servicios.</li>
            <li><strong>Publicación o reproducción de material producido.</strong> Permite la difusión de contenido, obras o material producido por los proveedores o contratistas cuando se cuente con autorización expresa, cumpliendo los derechos de propiedad intelectual.</li>
          </ul>
          <p className="mb-2 font-semibold">Operaciones sobre los datos:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Recolección:</strong> Captura de información de contacto, identificación, datos bancarios y material producido autorizado.</li>
            <li><strong>Almacenamiento:</strong> Conservación segura de los datos para garantizar la correcta operación de la plataforma, gestión de pagos y comunicación.</li>
            <li><strong>Uso:</strong> Acceso por personal autorizado de KBLE para coordinar servicios, procesar pagos, cumplir obligaciones contractuales y difundir material autorizado.</li>
            <li><strong>Actualización/rectificación:</strong> Los proveedores y contratistas pueden actualizar sus datos de contacto y otra información relevante.</li>
            <li><strong>Supresión:</strong> Eliminación de los datos cuando se cumplan las finalidades del tratamiento o a solicitud del titular, salvo obligaciones legales que requieran su conservación.</li>
          </ul>

          {/* 5. CLÁUSULA DE INTERMEDIACIÓN Y RESPONSABILIDADES */}
          <h2 className="text-2xl font-semibold mb-4">5. CLÁUSULA DE INTERMEDIACIÓN Y RESPONSABILIDADES</h2>

          <h3 className="text-xl font-semibold mb-3 mt-6">Intermediación de la plataforma</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>KBLE actúa únicamente como plataforma digital de intermediación que conecta a usuarios finales, tutores y comercios.</li>
            <li>KBLE no presta los servicios de tutoría ni vende productos o servicios de los comercios.</li>
            <li>La plataforma facilita la comunicación, contratación y transacciones entre los distintos actores, pero no asume responsabilidad por la calidad, entrega o cumplimiento de los servicios o productos ofrecidos por terceros.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Responsabilidad sobre los datos personales</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>KBLE es responsable del tratamiento de los datos personales que recolecta y almacena en su plataforma.</li>
            <li>Tutores y comercios son responsables de los datos que reciban directamente de los usuarios fuera de la plataforma, incluyendo pagos, información adicional y contacto directo.</li>
            <li>Usuarios son responsables de la información que compartan en sus interacciones dentro y fuera de la plataforma.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Transferencias de datos dentro de la plataforma</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Los datos personales podrán ser compartidos únicamente dentro de la plataforma para permitir la prestación de servicios y el acceso a promociones, conforme a las finalidades establecidas en esta política.</li>
            <li>Cualquier transferencia de datos personales a terceros fuera de la plataforma requerirá autorización previa del titular o se hará solo en cumplimiento de una obligación legal.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Limitación de corresponsabilidad</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>KBLE no es corresponsable de los tratamientos de datos realizados por tutores o comercios fuera de la plataforma.</li>
            <li>La plataforma garantiza que cualquier intercambio de información dentro del sistema se realiza bajo estrictos estándares de seguridad, confidencialidad y cumplimiento legal, pero no controla ni responde por tratamientos externos.</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">Aviso a los titulares</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Los titulares de datos serán informados de forma clara sobre quién es responsable de su información en cada relación dentro de la plataforma.</li>
            <li>Cualquier cambio en las transferencias o responsabilidades se comunicará oportunamente a través del sitio web y otros medios habilitados por KBLE.</li>
          </ul>

          {/* 6. DERECHOS DEL TITULAR */}
          <h2 className="text-2xl font-semibold mb-4">6. DERECHOS DEL TITULAR</h2>
          <p className="mb-4">El titular de datos personales tiene derecho a:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Conocer, actualizar y rectificar su información.</li>
            <li>Solicitar prueba de autorización otorgada.</li>
            <li>Ser informado del uso.</li>
            <li>Revocar autorización.</li>
            <li>Solicitar supresión siempre que no exista un deber legal o contractual de permanecer en la base de datos.</li>
            <li>Acceder gratuitamente.</li>
            <li>Presentar ante la Superintendencia de Industria y Comercio (SIC) quejas por infracciones a lo dispuesto en la normatividad vigente.</li>
            <li>Abstenerse de responder las preguntas sobre datos sensibles. Tendrá carácter facultativo las respuestas que versen sobre datos sensibles.</li>
          </ul>

          {/* 7. AUTORIZACIÓN */}
          <h2 className="text-2xl font-semibold mb-4">7. AUTORIZACIÓN</h2>
          <p className="mb-4">
            El tratamiento se realizará previa autorización expresa, libre e informada del titular, la cual se obtendrá mediante registro, aceptación digital, contrato de prestación de servicios, convenios, términos y condiciones en la plataforma digital, o cualquier conducta inequívoca.
          </p>

          {/* 8. DATOS */}
          <h2 className="text-2xl font-semibold mb-4">8. DATOS</h2>
          <p className="mb-4">
            El tratamiento de datos de proveedores y contratistas serán utilizados para contactarlos para cotizaciones, servicios, pagos, gestión de cumplimiento y facturación así como para publicación o reproducción del material que produzcan cuando esté autorizado.
          </p>

          {/* 9. TRATAMIENTO DE DATOS DE USUARIOS MENORES DE EDAD */}
          <h2 className="text-2xl font-semibold mb-4">9. TRATAMIENTO DE DATOS DE USUARIOS MENORES DE EDAD</h2>
          <p className="mb-4">
            KBLE asegura el respeto de los derechos prevalentes de los menores de edad. El tratamiento de sus datos personales se realizará exclusivamente con la autorización previa, expresa e informada de su representante legal, previa verificación de su identidad.
          </p>
          <p className="mb-4">
            En todo tratamiento se asegurará la Garantía de su Interés Superior y el respeto de sus derechos fundamentales. KBLE velará por el uso responsable y seguro de sus datos, protegiendo su privacidad y tomando todas las medidas necesarias para garantizar el cumplimiento de los principios legales.
          </p>
          <p className="mb-4">
            Se prohíbe expresamente el uso de los datos personales de menores de edad para fines de marketing, publicidad o profiling que no sean explícitamente y previamente autorizados por el representante legal y que no atiendan a su interés superior.
          </p>

          {/* 10. SEGURIDAD DE LA INFORMACIÓN */}
          <h2 className="text-2xl font-semibold mb-4">10. SEGURIDAD DE LA INFORMACIÓN</h2>
          <p className="mb-4">
            KBLE implementa medidas técnicas, humanas y administrativas razonables para proteger los datos.
          </p>

          {/* 11. ENCARGADOS Y TERCEROS */}
          <h2 className="text-2xl font-semibold mb-4">11. ENCARGADOS Y TERCEROS</h2>
          <p className="mb-4">KBLE podrá compartir y transferir datos con:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>proveedores tecnológicos</li>
            <li>pasarelas de pago</li>
            <li>servicios de analítica</li>
            <li>plataformas académicas</li>
            <li>empresas de envío de correos masivos</li>
            <li>entidades que prestan servicios a KBLE en virtud de contratos o convenios celebrados de acuerdo con el objeto social del mismo</li>
            <li>autoridades cuando la ley lo exija</li>
          </ul>

          {/* 12. TRANSFERENCIAS INTERNACIONALES */}
          <h2 className="text-2xl font-semibold mb-4">12. TRANSFERENCIAS INTERNACIONALES</h2>
          <p className="mb-4">
            KBLE podrá alojar información en servidores ubicados fuera de Colombia bajo estándares adecuados de protección.
          </p>

          {/* 13. CONSERVACIÓN */}
          <h2 className="text-2xl font-semibold mb-4">13. CONSERVACIÓN</h2>
          <p className="mb-4">
            Las bases de datos en las que se registrarán los datos personales tendrán una vigencia igual al tiempo en que se mantenga y utilice la información para las finalidades descritas en esta política. Una vez se cumplan esas finalidades y siempre que no exista un deber legal o contractual de conservar su información, sus datos serán eliminados de nuestras bases de datos.
          </p>

          {/* 14. ATENCIÓN DE PETICIONES, CONSULTAS Y RECLAMOS */}
          <h2 className="text-2xl font-semibold mb-4">14. ATENCIÓN DE PETICIONES, CONSULTAS Y RECLAMOS</h2>
          <p className="mb-4">
            KBLE ha designado al área de Protección de Datos Personales / Servicio al Usuario como responsable de la recepción, gestión y trámite de las peticiones, consultas y reclamos presentados por los titulares de datos personales, con el fin de garantizar el ejercicio efectivo de sus derechos de conocer, actualizar, rectificar y suprimir la información, así como de revocar la autorización otorgada, en los términos establecidos en la Ley 1581 de 2012 y las normas que la reglamentan.
          </p>
          <p className="mb-4">Los titulares podrán presentar sus solicitudes a través de los siguientes canales dispuestos por KBLE:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Correo electrónico: uniapp.col@gmail.com</li>
            <li>Aplicación móvil: KBLE</li>
            <li>Línea telefónica / WhatsApp: 3228698549</li>
          </ul>
          <p className="mb-4">
            Las peticiones, consultas y reclamos serán atendidos dentro de los términos legales previstos en la normatividad vigente, más específicamente para consultas dentro de los siguientes 10 días hábiles a su recibido y para reclamos dentro de los 15 días hábiles siguientes a su recibido. En el evento en que una solicitud sea presentada por un canal diferente a los aquí indicados o dirigida a un área distinta, KBLE dará el trámite correspondiente una vez conozca de ella, sin que ello exonere a la compañía de su obligación de atenderla de fondo y dentro de los plazos establecidos por la ley.
          </p>
          <p className="mb-4">
            Cuando la solicitud esté relacionada con datos personales cuyo tratamiento sea realizado directamente por tutores, restaurantes o negocios, en su calidad de responsables independientes del tratamiento, KBLE informará al titular dicha circunstancia y, cuando resulte procedente, orientará sobre el canal adecuado para el ejercicio de sus derechos, sin que ello implique asunción de responsabilidad por tratamientos ajenos a la plataforma.
          </p>

          {/* 15. MODIFICACIONES */}
          <h2 className="text-2xl font-semibold mb-4">15. MODIFICACIONES</h2>
          <p className="mb-4">
            Cualquier cambio sustancial en la presente Política de Privacidad y Tratamiento de Datos Personales será comunicado oportunamente a los titulares a través de la plataforma: KBLE.
          </p>
          <p className="mb-4">
            Adicionalmente, se dispondrá de una versión resumida de la política, destinada a ponerla en conocimiento de la ciudadanía en general y de los usuarios de la plataforma, en cumplimiento de lo establecido en la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes y vigentes.
          </p>
          <p className="mb-4">
            KBLE garantiza que todas las actualizaciones se realizarán respetando los principios de transparencia, legalidad y acceso a la información, permitiendo a los titulares conocer de manera clara los cambios en el tratamiento de sus datos personales.
          </p>

          {/* 16. VIGENCIA */}
          <h2 className="text-2xl font-semibold mb-4">16. VIGENCIA</h2>
          <p className="mb-4">
            La presente Política de Privacidad y Tratamiento de Datos Personales entra en vigencia a partir de la fecha de su publicación en el sitio web oficial de KBLE S.A.S. y en la aplicación móvil, y se mantendrá vigente hasta que sea modificada por la empresa, de conformidad con los procedimientos establecidos para su actualización.
          </p>
          <p className="mb-4">Para efectos de control y seguimiento de las versiones de esta política, se establece la siguiente información:</p>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-4 py-2 text-left">Versión</th>
                  <th className="border border-border px-4 py-2 text-left">Fecha de publicación</th>
                  <th className="border border-border px-4 py-2 text-left">Elaborado por</th>
                  <th className="border border-border px-4 py-2 text-left">Aprobado por</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-4 py-2">Primera edición</td>
                  <td className="border border-border px-4 py-2">30 de marzo de 2026</td>
                  <td className="border border-border px-4 py-2">Sebastian Klopstock Garcia</td>
                  <td className="border border-border px-4 py-2">Sebastian Klopstock Garcia</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
