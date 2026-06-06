import { supabase } from '../lib/supabase';

export const submitContactMessage = async (values: {
  email: string;
  phone: string;
  message: string;
}): Promise<void> => {
  const { error } = await supabase.from('contact_messages').insert({
    email: values.email.trim(),
    phone: values.phone.trim(),
    message: values.message.trim(),
  });
  if (error) {
    console.error('Error enviando mensaje de contacto:', error);
    throw error;
  }
};

// --- Feedback (usuarios logueados) ---

// Categorías que ve el usuario en el formulario de feedback.
export const FEEDBACK_CATEGORIES = [
  { value: 'app', label: 'Opinión o feedback de la app' },
  { value: 'praise', label: 'Felicitación' },
  { value: 'feature', label: 'Recomendación u opinión sobre una funcionalidad' },
  { value: 'tutor_partner', label: 'Reportar o felicitar a un tutor o aliado' },
] as const;

// Categoría que habilita el campo de texto libre "Tutor o aliado".
export const TUTOR_PARTNER_CATEGORY = 'tutor_partner';

// Compone el cuerpo estructurado que verá el admin en el visor de contacto existente.
// Se exporta para poder verificar el formato de forma aislada.
export const composeFeedbackBody = (values: {
  category: string; // etiqueta legible de la categoría
  userName: string;
  partner?: string;
  message: string;
}): string => {
  const lines = [`[Feedback] ${values.category}`, `De: ${values.userName}`];
  if (values.partner && values.partner.trim()) {
    lines.push(`Sobre tutor/aliado: ${values.partner.trim()}`);
  }
  lines.push('', values.message.trim());
  return lines.join('\n');
};

// Envía un mensaje de feedback reutilizando el proceso de contacto: compone el cuerpo
// (incluyendo el nombre del usuario) y delega en submitContactMessage. El admin lo recibe
// con la misma estructura y en el mismo visor.
export const submitFeedbackMessage = async (values: {
  category: string; // etiqueta legible
  userName: string;
  partner?: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> => {
  const message = composeFeedbackBody({
    category: values.category,
    userName: values.userName,
    partner: values.partner,
    message: values.message,
  });
  await submitContactMessage({
    email: values.email,
    phone: values.phone,
    message,
  });
};
