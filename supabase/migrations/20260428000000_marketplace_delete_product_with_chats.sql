-- =====================================================
-- Migración: Eliminación de productos con limpieza de chats
-- =====================================================
-- Propósito:
--   Permitir que un vendedor elimine sus productos del marketplace
--   sin que la existencia de conversaciones (messages) bloquee la
--   operación, eliminando además los chats asociados al producto.
--
--   El borrado del producto se mantiene como soft delete
--   (status = 'deleted') para preservar el historial de ventas
--   (la tabla sales mantiene FK con ON DELETE CASCADE).
-- =====================================================

-- =====================================================
-- 1. Asegurar políticas RLS de products explícitas
-- =====================================================

DROP POLICY IF EXISTS "Los vendedores pueden actualizar sus productos" ON public.products;

CREATE POLICY "Los vendedores pueden actualizar sus productos"
  ON public.products FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- =====================================================
-- 2. RPC: delete_marketplace_product
-- =====================================================

CREATE OR REPLACE FUNCTION public.delete_marketplace_product(p_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_seller_id UUID;
  v_current_status TEXT;
  v_deleted_messages_count INTEGER := 0;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'No autenticado'
    );
  END IF;

  SELECT seller_id, status
    INTO v_seller_id, v_current_status
  FROM public.products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Producto no encontrado'
    );
  END IF;

  IF v_seller_id <> v_user_id THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'No autorizado para eliminar este producto'
    );
  END IF;

  DELETE FROM public.messages
  WHERE product_id = p_product_id;
  GET DIAGNOSTICS v_deleted_messages_count = ROW_COUNT;

  IF v_current_status <> 'deleted' THEN
    UPDATE public.products
    SET status = 'deleted',
        updated_at = NOW()
    WHERE id = p_product_id;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'product_id', p_product_id,
    'deleted_messages', v_deleted_messages_count
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', FALSE,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

COMMENT ON FUNCTION public.delete_marketplace_product(UUID) IS
  'Elimina los chats asociados a un producto del marketplace y marca el producto como eliminado (soft delete). Solo el vendedor del producto puede ejecutarla.';

GRANT EXECUTE ON FUNCTION public.delete_marketplace_product(UUID) TO authenticated;
