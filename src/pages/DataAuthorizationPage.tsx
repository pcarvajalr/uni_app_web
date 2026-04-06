import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DataAuthorizationPage() {
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
          <h1 className="text-3xl font-bold mb-2">AUTORIZACIÓN EXPRESA, PREVIA E INFORMADA PARA EL TRATAMIENTO DE DATOS PERSONALES</h1>
          <p className="text-muted-foreground mb-8">Última actualización: 30 de marzo de 2026</p>

          <p className="mb-4">
            En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes, por medio del presente documento autorizo de manera previa, expresa, voluntaria e informada a KBLE, identificado con cédula de ciudadanía Nro. 1.125.578.439, con domicilio en Bogotá, correo electrónico uniapp.col@gmail.com, teléfono de contacto 3228698549, en su calidad de Responsable del Tratamiento, y que en adelante se denominará KBLE para que realice el tratamiento de mis datos personales conforme a los términos aquí establecidos y a la Política de Privacidad y Tratamiento de Datos Personales, la cual me fue informada y puesta a disposición con anterioridad a la recolección de mis datos.
          </p>

          <p className="mb-4">
            KBLE, podrá recolectar, almacenar, usar, circular, transferir, transmitir, actualizar, suprimir y, en general, tratar mis datos personales, de conformidad con la Constitución Política, la ley aplicable y la Política de Tratamiento de Datos Personales establecida para esta plataforma, garantizando mis derechos como titular de la información.
          </p>

          <p className="mb-4">
            Declaro que los datos personales suministrados han sido proporcionados de manera libre y voluntaria, que son veraces, completos y actualizados. Así mismo, manifiesto que la presente autorización me fue solicitada y puesta en mi conocimiento con anterioridad a la entrega de mis datos personales, que he leído y comprendido íntegramente el contenido de este documento y que lo suscribo de forma libre, expresa y voluntaria.
          </p>

          <p className="mb-4">
            Para las finalidades comerciales autorizadas, consiento de manera expresa ser contactado a través del correo electrónico, la dirección física y el número telefónico que suministré al momento del registro de mi usuario dentro de la aplicación.
          </p>

          <p className="mb-4">
            KBLE actúa únicamente como plataforma tecnológica de intermediación, facilitando la conexión y comunicación entre estudiantes, tutores, comercios aliados y otros usuarios registrados. KBLE no presta servicios de tutoría ni vende productos, ni es responsable por la calidad, ejecución, idoneidad, cumplimiento o condiciones de los servicios o productos ofrecidos por terceros a través de la plataforma. KBLE actuará como responsable únicamente respecto del tratamiento efectuado dentro de la infraestructura tecnológica correspondiente a la aplicación KBLE. Una vez el usuario comparta sus datos directamente con terceros a través de la plataforma, como tutores, comercios aliados u otros usuarios, entre otros, dichos terceros actuarán como Responsables independientes del tratamiento de datos, de acuerdo con la ley aplicable y sus propias políticas de tratamiento de datos.
          </p>

          {/* Finalidades del tratamiento */}
          <h2 className="text-2xl font-semibold mb-4">Finalidades del tratamiento de datos</h2>
          <p className="mb-4">
            Así mismo, autorizo de forma previa, expresa e informada a KBLE para tratar mis datos personales con las siguientes finalidades entendiendo que puedo aceptar o rechazar cada una de las finalidades de forma independiente:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Registro, creación, identificación, autenticación y gestión de usuarios dentro de la aplicación móvil. (Finalidad necesaria para el funcionamiento de la plataforma)</li>
            <li>Facilitar la conexión, interacción y comunicación entre tutores y estudiantes registrados en la plataforma. (Finalidad esencial del servicio de intermediación sin que la plataforma preste servicios de tutoría ni sea responsable por la ejecución de dichos servicios)</li>
            <li>Gestionar la publicación, administración y visualización de promociones, cupones, productos y servicios ofrecidos por los usuarios y comercios aliados, entendiendo que estos terceros son responsables del tratamiento posterior de los datos.</li>
            <li>Como usuario reconozco que al solicitar un servicio de un tercero dentro de la plataforma, instruyo a KBLE para transmitir sus datos a dicho tercero para la ejecución del contrato y la prestación del servicio.</li>
            <li>Otorgar visibilidad a comercios aliados, incluyendo la difusión de su información comercial dentro de la plataforma.</li>
            <li>Administrar la relación comercial, contractual y/o precontractual con usuarios, tutores, estudiantes y comercios aliados.</li>
            <li>Enviar comunicaciones informativas, operativas y comerciales, relacionadas con el uso de la plataforma, sus funcionalidades, promociones y actualizaciones. (Incluye comunicaciones comerciales y de mercadeo)</li>
            <li>Realizar análisis estadísticos, mediciones de uso y mejoras de la experiencia del usuario, con fines de optimización de la plataforma, garantizando la protección de los datos personales.</li>
            <li>Atender peticiones, quejas, reclamos y solicitudes presentadas por los titulares de la información.</li>
            <li>Dar cumplimiento a obligaciones legales, regulatorias y requerimientos de autoridades competentes.</li>
            <li>Autorizar la transferencia y transmisión internacional de datos a terceros países, incluso aquellos que no cuentan con niveles adecuados de protección de datos según la SIC.</li>
          </ul>

          {/* Derechos del titular */}
          <h2 className="text-2xl font-semibold mb-4">Derechos del titular</h2>
          <p className="mb-4">
            Los titulares de los datos personales tienen los derechos previstos en la Constitución Política de Colombia y en la Ley 1581 de 2012, especialmente los siguientes:
          </p>
          <ol className="list-[lower-alpha] pl-6 mb-4">
            <li>Acceder en forma gratuita a los datos proporcionados que hayan sido objeto de tratamiento.</li>
            <li>Solicitar la actualización y rectificación de su información frente a datos parciales, inexactos, incompletos, fraccionados, que induzcan a error, o frente a aquellos cuyo tratamiento esté prohibido o no haya sido autorizado.</li>
            <li>Solicitar prueba de la autorización otorgada para el Tratamiento de sus datos personales.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a lo dispuesto en la normatividad vigente en materia de protección de datos personales.</li>
            <li>Revocar la autorización otorgada y/o solicitar la supresión de sus datos personales, salvo que exista un deber legal o contractual que haga imperativo conservar la información.</li>
            <li>Abstenerse de responder preguntas relacionadas con datos personales sensibles o datos de niñas, niños y adolescentes, en los casos en que corresponda, sin que ello afecte la posibilidad de usar la plataforma, salvo para las funcionalidades estrictamente necesarias.</li>
          </ol>

          {/* Datos personales sensibles */}
          <h2 className="text-2xl font-semibold mb-4">Datos personales sensibles</h2>
          <p className="mb-4">
            Autorizo el tratamiento de los siguientes datos sensibles: fotografías para el perfil de usuario, galería de fotos, datos de edad y ubicación GPS. Manifiesto que he sido informado(a) de que, en caso de que se requiera la recolección de estos datos personales sensibles, tengo el derecho a contestar o no las preguntas que me sean formuladas, así como a entregar o no dichos datos, sin que ello sea obligatorio ni condicione el acceso a la plataforma o a sus servicios.
          </p>
          <p className="mb-4">
            Entiendo que se consideran datos personales sensibles aquellos que afectan mi intimidad o cuyo uso indebido puede generar discriminación, tales como, entre otros, los datos que revelen el origen racial o étnico, la orientación política, las convicciones religiosas o filosóficas, los datos relativos a la salud, a la vida sexual y los datos biométricos.
          </p>

          {/* Datos de menores de edad */}
          <h2 className="text-2xl font-semibold mb-4">Datos de menores de edad</h2>
          <p className="mb-4">En caso de datos de niños, niñas o adolescentes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>La autorización se otorga únicamente por el padre, madre o representante legal.</li>
            <li>El tratamiento será únicamente para el funcionamiento de la plataforma y no incluirá marketing comercial.</li>
            <li>Se garantiza el derecho del menor a no suministrar información sensible y se implementará mecanismos razonables de verificación de la calidad de representante legal antes de tratar datos de menores.</li>
          </ul>

          {/* Canales para ejercer derechos */}
          <h2 className="text-2xl font-semibold mb-4">Canales para ejercer derechos</h2>
          <p className="mb-4">
            Los derechos mencionados anteriormente podrán ser ejercidos a través de los canales y medios dispuestos por KBLE para la atención al público, la línea de atención nacional será 3228698549 y el correo electrónico uniapp.col@gmail.com cuya información puedo consultar en la aplicación KBLE para la atención de requerimientos relacionados con el tratamiento de mis datos personales y el ejercicio de los derechos mencionados en esta autorización:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>La línea de atención: 3228698549</li>
            <li>Correo electrónico: uniapp.col@gmail.com</li>
          </ul>
          <p className="mb-4">
            Por todo lo anterior, he otorgado mi consentimiento a KBLE para que trate mi información personal de acuerdo con la Política de Tratamiento de Datos Personales dispuesta y que me dio a conocer antes de recolectar mis datos personales.
          </p>

          {/* Aceptación */}
          <h2 className="text-2xl font-semibold mb-4">ACEPTACIÓN</h2>
          <p className="mb-4 font-semibold">
            Al registrarme, marcar el checkbox o usar la plataforma, manifiesto mi consentimiento.
          </p>
        </div>
      </div>
    </div>
  );
}
