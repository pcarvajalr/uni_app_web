-- ============================================
-- MIGRACIÓN 012: Actualizar trigger para campos opcionales en registro
-- ============================================
-- Este script actualiza el trigger handle_new_user para incluir
-- student_id y campus desde el metadata del usuario durante el registro.

-- Actualizar la función para manejar campos opcionales
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, student_id, campus)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.raw_user_meta_data->>'avatar_url',
    NULLIF(NEW.raw_user_meta_data->>'student_id', ''),
    NULLIF(NEW.raw_user_meta_data->>'campus', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: El trigger on_auth_user_created ya existe, solo se actualiza la función.
-- No es necesario recrear el trigger.

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para verificar que la función se actualizó correctamente:
-- SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
