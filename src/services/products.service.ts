import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export interface ProductWithSeller extends Product {
  seller: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    rating: number;
    total_sales: number;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
}

export interface ProductFilters {
  category_id?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  seller_id?: string;
  status?: 'available' | 'sold' | 'reserved';
}

// Obtener todos los productos con filtros
export const getProducts = async (filters?: ProductFilters) => {
  try {
    let query = supabase
      .from('products')
      .select(
        `
        *,
        seller:users!products_seller_id_fkey(
          id,
          full_name,
          avatar_url,
          rating,
          total_sales
        ),
        category:categories(
          id,
          name,
          icon
        )
      `
      )
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.neq('status', 'deleted');
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price', filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price', filters.max_price);
    }

    if (filters?.seller_id) {
      query = query.eq('seller_id', filters.seller_id);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      handleSupabaseError(error);
    }

    return data as ProductWithSeller[];
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

// Obtener un producto por ID
export const getProductById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        seller:users!products_seller_id_fkey(
          id,
          full_name,
          avatar_url,
          rating,
          total_sales,
          phone
        ),
        category:categories(
          id,
          name,
          icon
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    // Incrementar contador de vistas
    await incrementProductViews(id);

    return data as ProductWithSeller;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    throw error;
  }
};

// Crear un nuevo producto
export const createProduct = async (product: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase.from('products').insert(product).select().single();

    if (error) {
      handleSupabaseError(error);
    }

    return data as Product;
  } catch (error) {
    console.error('Error creando producto:', error);
    throw error;
  }
};

// Actualizar un producto
export const updateProduct = async (id: string, updates: ProductUpdate) => {
  try {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();

    if (error) {
      handleSupabaseError(error);
    }

    return data as Product;
  } catch (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }
};

// Eliminar (soft delete) un producto
export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase.from('products').update({ status: 'deleted' }).eq('id', id);

    if (error) {
      handleSupabaseError(error);
    }

    return true;
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
};

// Incrementar vistas de un producto
export const incrementProductViews = async (id: string) => {
  try {
    // Intentar usar RPC si existe
    const { error: rpcError } = await supabase.rpc('increment', {
      table_name: 'products',
      row_id: id,
      column_name: 'views',
    });

    // Si el RPC no existe, usar update manual
    if (rpcError) {
      // Obtener el valor actual y actualizarlo
      const { data: product } = await supabase
        .from('products')
        .select('views')
        .eq('id', id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ views: product.views + 1 })
          .eq('id', id);
      }
    }
  } catch (error) {
    // No lanzar error si falla incrementar vistas
    console.warn('Error incrementando vistas:', error);
  }
};

// Agregar/quitar producto de favoritos
export const toggleProductFavorite = async (productId: string, userId: string) => {
  try {
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('item_type', 'product')
      .single();

    if (existing) {
      // Eliminar favorito
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id);

      if (error) {
        handleSupabaseError(error);
      }

      return false; // No es favorito
    } else {
      // Agregar favorito
      const { error } = await supabase.from('favorites').insert({
        user_id: userId,
        product_id: productId,
        item_type: 'product',
      });

      if (error) {
        handleSupabaseError(error);
      }

      return true; // Es favorito
    }
  } catch (error) {
    console.error('Error toggling favorito:', error);
    throw error;
  }
};

// Obtener productos favoritos del usuario
export const getUserFavoriteProducts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(
        `
        *,
        product:products!favorites_product_id_fkey(
          *,
          seller:users!products_seller_id_fkey(
            id,
            full_name,
            avatar_url,
            rating
          ),
          category:categories(
            id,
            name,
            icon
          )
        )
      `
      )
      .eq('user_id', userId)
      .eq('item_type', 'product')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    throw error;
  }
};

// Obtener categorías de productos
export const getProductCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('type', ['product', 'both'])
      .order('name');

    if (error) {
      handleSupabaseError(error);
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    throw error;
  }
};
