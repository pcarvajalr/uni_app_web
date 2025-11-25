-- ============================================
-- TRIGGERS DE FAVORITOS - CONFIGURACIÓN DEFINITIVA
-- ============================================
-- Este script corrige el problema donde RLS bloquea los triggers
-- de actualización del contador de favoritos.
--
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Eliminar triggers existentes
DROP TRIGGER IF EXISTS on_favorite_added ON public.favorites;
DROP TRIGGER IF EXISTS on_favorite_removed ON public.favorites;

-- 2. Eliminar funciones existentes
DROP FUNCTION IF EXISTS increment_favorites_count();
DROP FUNCTION IF EXISTS decrement_favorites_count();

-- 3. Crear función para INCREMENTAR con SECURITY DEFINER (bypass RLS)
CREATE OR REPLACE FUNCTION increment_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_type = 'product' AND NEW.product_id IS NOT NULL THEN
    UPDATE public.products
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear función para DECREMENTAR con SECURITY DEFINER (bypass RLS)
CREATE OR REPLACE FUNCTION decrement_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.item_type = 'product' AND OLD.product_id IS NOT NULL THEN
    UPDATE public.products
    SET favorites_count = GREATEST(0, favorites_count - 1)
    WHERE id = OLD.product_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger para INSERT (marcar favorito)
CREATE TRIGGER on_favorite_added
  AFTER INSERT ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION increment_favorites_count();

-- 6. Crear trigger para DELETE (desmarcar favorito)
CREATE TRIGGER on_favorite_removed
  AFTER DELETE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION decrement_favorites_count();

-- 7. Sincronizar contadores existentes con la cantidad real
UPDATE public.products p
SET favorites_count = (
  SELECT COUNT(*)
  FROM public.favorites f
  WHERE f.product_id = p.id
  AND f.item_type = 'product'
);

-- 8. Verificación
SELECT 'Triggers configurados correctamente' as status;
