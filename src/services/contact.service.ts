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
