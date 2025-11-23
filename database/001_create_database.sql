-- ============================================
-- UNI APP - ESQUEMA DE BASE DE DATOS SUPABASE
-- ============================================
-- Este archivo contiene el esquema completo para la aplicación universitaria
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- NOTAS IMPORTANTES SOBRE TIPOS DE DATOS
-- ============================================
-- 1. DECIMAL vs NUMBER: Los campos DECIMAL(x,y) se mapean a 'number' en TypeScript,
--    lo que puede causar pérdida de precisión en cálculos monetarios.
--    Recomendación: Usar bibliotecas como decimal.js en el frontend para cálculos precisos.
--
-- 2. CHECK CONSTRAINTS: Los constraints CHECK (ej: status IN ('active', 'paused'))
--    NO se reflejan en los tipos generados de TypeScript como literal unions.
--    Para mejor type-safety, considerar migrar a ENUMs de PostgreSQL en el futuro.
--
-- 3. POINT/GEOMETRY: Los tipos geométricos (POINT) se mapean a 'unknown' en TypeScript.
--
-- 4. MEJORA FUTURA: Convertir campos TEXT+CHECK a ENUMs de PostgreSQL generaría
--    tipos literal union automáticamente en TypeScript para mayor seguridad de tipos.

-- ============================================
-- 1. EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. TABLAS PRINCIPALES
-- ============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')) NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  student_id TEXT UNIQUE, -- Matrícula o ID estudiantil
  career TEXT, -- Carrera
  semester INTEGER,
  campus TEXT,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0 NOT NULL,
  total_sales INTEGER DEFAULT 0 NOT NULL,
  total_tutoring_sessions INTEGER DEFAULT 0 NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  is_tutor BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorías para productos y tutorías
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('product', 'tutoring', 'both', 'location')),
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos del marketplace
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  images TEXT[] DEFAULT '{}', -- Array de URLs de imágenes
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  -- NOTA: Para mejor type-safety, considerar migrar a ENUM en el futuro
  status TEXT DEFAULT 'available' NOT NULL CHECK (status IN ('available', 'sold', 'reserved', 'deleted')),
  location TEXT,
  views INTEGER DEFAULT 0 NOT NULL,
  favorites_count INTEGER DEFAULT 0 NOT NULL,
  is_negotiable BOOLEAN DEFAULT TRUE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas/transacciones
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de tutoría ofrecidas
CREATE TABLE public.tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL CHECK (price_per_hour >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  mode TEXT NOT NULL CHECK (mode IN ('presential', 'online', 'both')),
  location TEXT,
  meeting_url TEXT,
  max_students INTEGER DEFAULT 1 NOT NULL CHECK (max_students > 0),
  available_days TEXT[] DEFAULT '{}', -- ['monday', 'wednesday', 'friday']
  available_hours TEXT, -- JSON con horarios disponibles
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'paused', 'deleted')),
  rating DECIMAL(3,2) DEFAULT 0.0 NOT NULL,
  total_bookings INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas de tutorías
CREATE TABLE public.tutoring_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.tutoring_sessions(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  meeting_url TEXT,
  location TEXT,
  notes TEXT,
  student_rating INTEGER CHECK (student_rating >= 1 AND student_rating <= 5),
  student_review TEXT,
  tutor_notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes de seguridad
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('security', 'emergency', 'maintenance', 'lost_found', 'other')),
  category TEXT, -- Subcategoría específica
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  location_coordinates POINT, -- Coordenadas geográficas
  images TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'rejected')),
  assigned_to TEXT, -- Departamento o persona asignada
  is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'sale', 'booking', 'review', 'system', 'security')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Datos adicionales (IDs, links, etc.)
  image_url TEXT,
  action_url TEXT, -- URL para navegar al hacer clic
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cupones
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_purchase_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2), -- Para cupones porcentuales
  usage_limit INTEGER, -- Límite total de usos
  usage_per_user INTEGER DEFAULT 1, -- Límite por usuario
  used_count INTEGER DEFAULT 0 NOT NULL,
  applicable_to TEXT CHECK (applicable_to IN ('products', 'tutoring', 'both')),
  category_ids UUID[] DEFAULT '{}', -- Categorías específicas
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cupones usados por usuarios
CREATE TABLE public.user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  used_count INTEGER DEFAULT 0 NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- Tabla de ubicaciones del campus
CREATE TABLE public.campus_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('building', 'cafeteria', 'library', 'lab', 'office', 'parking', 'sports', 'other')),
  description TEXT,
  building TEXT,
  floor TEXT,
  coordinates POINT NOT NULL, -- Coordenadas geográficas
  address TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB, -- Horarios de apertura
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}', -- ['wifi', 'accessible', 'air_conditioning']
  is_accessible BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes entre usuarios
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  tutoring_session_id UUID REFERENCES public.tutoring_sessions(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de favoritos
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'tutoring_session')),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  tutoring_session_id UUID REFERENCES public.tutoring_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type, product_id),
  UNIQUE(user_id, item_type, tutoring_session_id),
  CHECK (
    (item_type = 'product' AND product_id IS NOT NULL AND tutoring_session_id IS NULL) OR
    (item_type = 'tutoring_session' AND tutoring_session_id IS NOT NULL AND product_id IS NULL)
  )
);

-- Tabla de reseñas/calificaciones
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.tutoring_bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  type TEXT NOT NULL CHECK (type IN ('seller', 'buyer', 'tutor', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, sale_id),
  UNIQUE(reviewer_id, booking_id)
);

-- ============================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX idx_tutoring_sessions_tutor_id ON public.tutoring_sessions(tutor_id);
CREATE INDEX idx_tutoring_sessions_status ON public.tutoring_sessions(status);

CREATE INDEX idx_tutoring_bookings_student_id ON public.tutoring_bookings(student_id);
CREATE INDEX idx_tutoring_bookings_tutor_id ON public.tutoring_bookings(tutor_id);
CREATE INDEX idx_tutoring_bookings_status ON public.tutoring_bookings(status);
CREATE INDEX idx_tutoring_bookings_scheduled_date ON public.tutoring_bookings(scheduled_date);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_priority ON public.reports(priority);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

CREATE INDEX idx_sales_buyer_id ON public.sales(buyer_id);
CREATE INDEX idx_sales_seller_id ON public.sales(seller_id);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- ============================================
-- 4. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutoring_sessions_updated_at BEFORE UPDATE ON public.tutoring_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutoring_bookings_updated_at BEFORE UPDATE ON public.tutoring_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campus_locations_updated_at BEFORE UPDATE ON public.campus_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil de usuario automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para incrementar contador de favoritos
CREATE OR REPLACE FUNCTION increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_type = 'product' THEN
    UPDATE public.products SET favorites_count = favorites_count + 1 WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_favorite_added
  AFTER INSERT ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION increment_favorites_count();

-- Función para decrementar contador de favoritos
CREATE OR REPLACE FUNCTION decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.item_type = 'product' THEN
    UPDATE public.products SET favorites_count = favorites_count - 1 WHERE id = OLD.product_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_favorite_removed
  AFTER DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION decrement_favorites_count();

-- Función para actualizar contador de ventas del usuario
CREATE OR REPLACE FUNCTION update_user_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.users SET total_sales = total_sales + 1 WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sale_completed
  AFTER UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION update_user_sales_count();

-- Función para actualizar estado del producto cuando se vende
CREATE OR REPLACE FUNCTION update_product_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE public.products SET status = 'sold' WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_sale_completed_update_product
  AFTER UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION update_product_status_on_sale();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Función helper para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA USERS
CREATE POLICY "Los usuarios pueden ver todos los perfiles públicos"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- POLÍTICAS PARA PRODUCTS
CREATE POLICY "Todos pueden ver productos disponibles"
  ON public.products FOR SELECT
  USING (status != 'deleted');

CREATE POLICY "Los usuarios autenticados pueden crear productos"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Los vendedores pueden actualizar sus productos"
  ON public.products FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Los vendedores pueden eliminar sus productos"
  ON public.products FOR DELETE
  USING (auth.uid() = seller_id);

-- POLÍTICAS PARA SALES
CREATE POLICY "Los usuarios pueden ver sus propias ventas y compras"
  ON public.sales FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Los compradores pueden crear ventas"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Los vendedores y compradores pueden actualizar ventas"
  ON public.sales FOR UPDATE
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- POLÍTICAS PARA TUTORING_SESSIONS
CREATE POLICY "Todos pueden ver sesiones activas"
  ON public.tutoring_sessions FOR SELECT
  USING (status = 'active');

CREATE POLICY "Los tutores pueden crear sesiones"
  ON public.tutoring_sessions FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Los tutores pueden actualizar sus sesiones"
  ON public.tutoring_sessions FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "Los tutores pueden eliminar sus sesiones"
  ON public.tutoring_sessions FOR DELETE
  USING (auth.uid() = tutor_id);

-- POLÍTICAS PARA TUTORING_BOOKINGS
CREATE POLICY "Los usuarios pueden ver sus propias reservas"
  ON public.tutoring_bookings FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "Los estudiantes pueden crear reservas"
  ON public.tutoring_bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Los estudiantes y tutores pueden actualizar reservas"
  ON public.tutoring_bookings FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- POLÍTICAS PARA REPORTS
CREATE POLICY "Todos pueden ver reportes (excepto anónimos privados)"
  ON public.reports FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear reportes"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id OR is_anonymous = true);

CREATE POLICY "Los reportadores pueden actualizar sus reportes"
  ON public.reports FOR UPDATE
  USING (auth.uid() = reporter_id);

CREATE POLICY "Los admins pueden actualizar cualquier reporte"
  ON public.reports FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Los admins pueden eliminar reportes"
  ON public.reports FOR DELETE
  USING (public.is_admin());

-- POLÍTICAS PARA NOTIFICATIONS
CREATE POLICY "Los usuarios solo pueden ver sus propias notificaciones"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus notificaciones"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Los admins pueden crear notificaciones para cualquier usuario"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Los admins pueden ver todas las notificaciones"
  ON public.notifications FOR SELECT
  USING (public.is_admin());

-- POLÍTICAS PARA COUPONS
CREATE POLICY "Todos pueden ver cupones activos y válidos"
  ON public.coupons FOR SELECT
  USING (is_active = true AND valid_until > NOW());

CREATE POLICY "Los admins pueden ver todos los cupones"
  ON public.coupons FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Los admins pueden crear cupones"
  ON public.coupons FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Los admins pueden actualizar cupones"
  ON public.coupons FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Los admins pueden eliminar cupones"
  ON public.coupons FOR DELETE
  USING (public.is_admin());

-- POLÍTICAS PARA USER_COUPONS
CREATE POLICY "Los usuarios pueden ver sus propios cupones usados"
  ON public.user_coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden registrar uso de cupones"
  ON public.user_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus cupones"
  ON public.user_coupons FOR UPDATE
  USING (auth.uid() = user_id);

-- POLÍTICAS PARA CAMPUS_LOCATIONS
CREATE POLICY "Todos pueden ver ubicaciones del campus"
  ON public.campus_locations FOR SELECT
  USING (true);

CREATE POLICY "Los admins pueden crear ubicaciones del campus"
  ON public.campus_locations FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Los admins pueden actualizar ubicaciones del campus"
  ON public.campus_locations FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Los admins pueden eliminar ubicaciones del campus"
  ON public.campus_locations FOR DELETE
  USING (public.is_admin());

-- POLÍTICAS PARA MESSAGES
CREATE POLICY "Los usuarios pueden ver sus propios mensajes"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Los usuarios pueden enviar mensajes"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Los destinatarios pueden actualizar mensajes (marcar como leído)"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- POLÍTICAS PARA FAVORITES
CREATE POLICY "Los usuarios pueden ver sus propios favoritos"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear favoritos"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus favoritos"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- POLÍTICAS PARA REVIEWS
CREATE POLICY "Todos pueden ver las reseñas"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear reseñas"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- POLÍTICAS PARA CATEGORIES
CREATE POLICY "Todos pueden ver categorías"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Los admins pueden crear categorías"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Los admins pueden actualizar categorías"
  ON public.categories FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Los admins pueden eliminar categorías"
  ON public.categories FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 6. DATOS INICIALES (SEED DATA)
-- ============================================

-- Insertar categorías para productos
INSERT INTO public.categories (name, type, icon, description) VALUES
  ('Libros', 'product', 'book', 'Libros de texto, novelas, apuntes'),
  ('Electrónica', 'product', 'laptop', 'Laptops, tablets, accesorios tecnológicos'),
  ('Ropa', 'product', 'shirt', 'Ropa, zapatos y accesorios'),
  ('Útiles Escolares', 'product', 'pencil', 'Cuadernos, plumas, mochilas'),
  ('Deportes', 'product', 'dumbbell', 'Equipamiento deportivo'),
  ('Otros', 'product', 'package', 'Otros productos');

-- Insertar categorías para tutorías
INSERT INTO public.categories (name, type, icon, description) VALUES
  ('Matemáticas', 'tutoring', 'calculator', 'Cálculo, álgebra, geometría'),
  ('Programación', 'tutoring', 'code', 'Programación, desarrollo web, algoritmos'),
  ('Idiomas', 'tutoring', 'languages', 'Inglés, francés, alemán'),
  ('Ciencias', 'tutoring', 'flask', 'Física, química, biología'),
  ('Ingeniería', 'tutoring', 'cog', 'Materias de ingeniería'),
  ('Negocios', 'tutoring', 'briefcase', 'Administración, contabilidad, finanzas');

-- Insertar ubicaciones del campus (ejemplos)
INSERT INTO public.campus_locations (name, type, description, building, coordinates, is_accessible) VALUES
  ('Biblioteca Central', 'library', 'Biblioteca principal del campus', 'Edificio A', POINT(-99.133, 19.433), true),
  ('Cafetería Norte', 'cafeteria', 'Cafetería principal', 'Edificio B', POINT(-99.134, 19.434), true),
  ('Laboratorio de Computación', 'lab', 'Labs de cómputo', 'Edificio C', POINT(-99.132, 19.432), true),
  ('Centro Deportivo', 'sports', 'Gimnasio y canchas', 'Edificio D', POINT(-99.135, 19.435), true);

-- Insertar cupón de bienvenida
INSERT INTO public.coupons (code, title, description, discount_type, discount_value, applicable_to, valid_from, valid_until, is_active, usage_per_user) VALUES
  ('BIENVENIDA2024', 'Cupón de Bienvenida', 'Descuento del 10% en tu primera compra o tutoría', 'percentage', 10, 'both', NOW(), NOW() + INTERVAL '1 year', true, 1);

-- ============================================
-- 7. STORAGE BUCKETS
-- ============================================
-- Estos comandos se ejecutan desde la interfaz de Supabase Storage o via API

-- Crear buckets para almacenar archivos
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================

-- Para verificar que todo se creó correctamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
