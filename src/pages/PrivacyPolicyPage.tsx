import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold mb-8">AVISO DE PRIVACIDAD – TRATAMIENTO DE DATOS PERSONALES</h1>

          <p className="mb-4">
            De conformidad con lo dispuesto en la Ley 1581 de 2012, el Decreto 1377 de 2013, el Decreto 1074 de 2015 y demás normas concordantes, KBLE identificado con cédula 1.125.578.439 de Bogotá, domiciliado en Bogotá, Colombia, en su calidad de Responsable del Tratamiento de Datos Personales, y que en adelante se denominará KBLE, pone en conocimiento de los titulares el presente Aviso de Privacidad.
          </p>

          <p className="mb-4">
            Para efectos de la atención de consultas, reclamos, solicitudes de actualización, rectificación o supresión de datos personales, los titulares podrán comunicarse a través de los siguientes canales de contacto:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Correo electrónico: uniapp.col@gmail.com</li>
            <li>Teléfono: 3228698549</li>
          </ul>

          <p className="mb-4">
            El presente aviso tiene como finalidad informar a los usuarios sobre la forma en que serán recolectados, almacenados, usados, circulados y, en general, tratados sus datos personales con ocasión de la interacción y uso de la plataforma digital. Dicho tratamiento se realizará de manera responsable, conforme a los principios de legalidad, finalidad, libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad, así como a los estándares legales y técnicos aplicables.
          </p>

          <p className="mb-4">
            KBLE, en su calidad de Responsable del Tratamiento de Datos Personales, informa a los usuarios de KBLE que actúa únicamente como una plataforma tecnológica de intermediación, la cual permite el contacto y la interacción entre estudiantes, tutores, comercios, aliados y demás usuarios registrados. En ningún caso la plataforma KBLE presta servicios de tutoría, vende productos, ni es responsable por la calidad, idoneidad, precios, cumplimiento o ejecución de los servicios o productos ofrecidos por terceros a través de la plataforma.
          </p>

          <p className="mb-4">
            Los datos personales recolectados serán tratados para permitir el registro, autenticación, operación y administración de la plataforma, así como para facilitar la conexión y comunicación entre los usuarios. Para el cumplimiento de dichas finalidades, los datos personales podrán ser compartidos con tutores, estudiantes, comercios aliados u otros usuarios, y transmitidos a terceros encargados del tratamiento, tales como proveedores tecnológicos, servicios de alojamiento en la nube, pasarelas de pago, herramientas de mensajería y soporte, quienes actuarán conforme a las instrucciones de KBLE y a la normatividad vigente.
          </p>

          <p className="mb-4">
            Los datos personales recolectados serán almacenados, usados, circulados, transmitidos y/o transferidos, según corresponda, por KBLE, y serán tratados, entre otras, para las siguientes finalidades relacionadas con la operación de la plataforma tecnológica de intermediación:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Registro, creación, identificación, autenticación y gestión de usuarios dentro de la aplicación web.</li>
            <li>Facilitar la conexión, interacción y comunicación entre tutores y estudiantes registrados en la plataforma.</li>
            <li>Gestionar la publicación, administración y visualización de promociones, cupones, productos y servicios ofrecidos por los usuarios y comercios aliados.</li>
            <li>Otorgar visibilidad a comercios aliados, incluyendo la difusión de su información comercial dentro de la plataforma.</li>
            <li>Administrar la relación comercial, contractual y/o precontractual con usuarios, tutores, estudiantes y comercios aliados.</li>
            <li>Enviar comunicaciones informativas, operativas y comerciales relacionadas con el uso de la plataforma, sus funcionalidades, promociones y actualizaciones.</li>
            <li>Realizar análisis estadísticos, mediciones de uso y mejoras de la experiencia del usuario, garantizando la protección de los datos personales.</li>
            <li>Atender peticiones, quejas, reclamos y solicitudes presentadas por los titulares.</li>
            <li>Dar cumplimiento a obligaciones legales, regulatorias y requerimientos de autoridades competentes.</li>
          </ul>

          <p className="mb-4">
            De conformidad con la ley, los titulares de los datos personales tienen los siguientes derechos:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Conocer, actualizar y rectificar sus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
            <li>Ser informados sobre el uso que se ha dado a sus datos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
            <li>Revocar la autorización y/o solicitar la supresión de los datos, cuando sea procedente.</li>
            <li>Acceder de manera gratuita a sus datos personales.</li>
            <li>Abstenerse de responder preguntas sobre datos sensibles o de menores de edad.</li>
          </ul>
          <p className="mb-4">
            El titular de los datos tiene carácter facultativo de entregar datos sensibles, y si así lo hiciere reconoce que KBLE, los tratará mediante estándares de reserva y seguridad.
          </p>

          <p className="mb-4">
            En caso del registro de menores de edad, el Tratamiento de sus datos personales se realizará únicamente con la autorización previa, expresa e informada de los padres o representantes legales, y se limitará a finalidades estrictamente relacionadas con la operación de la plataforma, sin el envío de comunicaciones comerciales o de mercadeo, garantizando en todo momento la protección de sus derechos fundamentales.
          </p>

          <p className="mb-4">
            El ejercicio de los derechos podrá realizarse mediante solicitud enviada al siguiente correo electrónico: uniapp.col@gmail.com
          </p>

          <p className="mb-4">
            Así mismo, el titular podrá consultar la Política de Tratamiento de Datos Personales, así como las actualizaciones o modificaciones que se realicen a la misma o al presente Aviso de Privacidad, a través de los canales dispuestos por el Responsable para tal efecto y que es la aplicación móvil KBLE.
          </p>

          <p className="mb-4">
            En caso de que se recolecten datos personales sensibles, tales como aquellos que puedan afectar la intimidad del titular o cuyo uso indebido pueda generar discriminación (incluyendo, entre otros, datos relacionados con el origen racial o étnico, orientación sexual, filiación política o religiosa), se informará previamente al titular sobre el carácter sensible de dichos datos, así como su derecho a no suministrarlos. En consecuencia, el titular podrá decidir de manera libre, expresa y voluntaria si autoriza o no su tratamiento.
          </p>

          <p className="mb-4">
            KBLE informa a los titulares que la Política de Tratamiento de Datos Personales se encuentra disponible para su consulta a través de la aplicación móvil KBLE.
          </p>

          <p className="mb-4">
            Cualquier actualización o modificación que se realice a dicha política o al presente aviso será informada oportunamente mediante los mismos mecanismos, garantizando en todo momento el acceso a la versión vigente por parte de los titulares.
          </p>

          <p className="mb-4">
            En el evento en que KBLE, en su calidad de Responsable del Tratamiento, llegue a recolectar datos personales sensibles, tales como aquellos que revelen el origen racial o étnico, la orientación sexual, las convicciones religiosas, filosóficas o políticas, entre otros, informará de manera previa y expresa al titular sobre el carácter sensible de dicha información. Así mismo, se le garantizará el derecho a decidir libre y voluntariamente si suministra o no este tipo de datos, dejando claro que su entrega es facultativa y que la negativa a proporcionarlos no afectará el acceso a los servicios o actividades, salvo en los casos en que dichos datos sean estrictamente necesarios conforme a la ley. El Titular puede acceder a nuestra Política de Tratamiento de información, la cual se encuentra publicada en la aplicación móvil KBLE.
          </p>

          <p className="text-muted-foreground mt-8 font-semibold">
            Fecha de entrada en vigencia: 30 de marzo de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
