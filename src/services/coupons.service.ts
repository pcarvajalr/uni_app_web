import { supabase, handleSupabaseError, unwrapData } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Coupon = Database['public']['Tables']['coupons']['Row'];
type UserCoupon = Database['public']['Tables']['user_coupons']['Row'];

export interface CouponWithUsage extends Coupon {
  user_usage?: {
    used_count: number;
    last_used_at: string | null;
  };
}

// Obtener todos los cupones activos y válidos
export const getActiveCoupons = async () => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .order('created_at', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo cupones activos:', error);
    throw error;
  }
};

// Obtener cupones del usuario con información de uso
export const getUserCoupons = async (userId: string) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('coupons')
      .select(
        `
        *,
        user_coupons!inner(
          used_count,
          last_used_at
        )
      `
      )
      .eq('user_coupons.user_id', userId)
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .order('created_at', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo cupones del usuario:', error);
    throw error;
  }
};

// Buscar cupón por código
export const getCouponByCode = async (code: string) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new Error('Cupón no válido o expirado');
    }

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error buscando cupón:', error);
    throw error;
  }
};

// Validar si un cupón puede ser usado por un usuario
export const validateCoupon = async (
  couponId: string,
  userId: string,
  applicableTo: 'products' | 'tutoring',
  purchaseAmount: number,
  categoryId?: string
) => {
  try {
    // Obtener cupón
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single();

    const validatedCoupon = unwrapData(coupon, couponError);

    // Validar si está activo
    if (!validatedCoupon.is_active) {
      throw new Error('Este cupón no está activo');
    }

    // Validar fechas
    const now = new Date();
    const validFrom = validatedCoupon.valid_from ? new Date(validatedCoupon.valid_from) : null;
    const validUntil = new Date(validatedCoupon.valid_until);

    if (validFrom && now < validFrom) {
      throw new Error('Este cupón aún no está disponible');
    }

    if (now > validUntil) {
      throw new Error('Este cupón ha expirado');
    }

    // Validar límite de uso total
    if (validatedCoupon.usage_limit && (validatedCoupon.used_count ?? 0) >= validatedCoupon.usage_limit) {
      throw new Error('Este cupón ha alcanzado su límite de usos');
    }

    // Validar aplicabilidad
    if (validatedCoupon.applicable_to && validatedCoupon.applicable_to !== 'both' && validatedCoupon.applicable_to !== applicableTo) {
      throw new Error(`Este cupón solo es válido para ${validatedCoupon.applicable_to === 'products' ? 'productos' : 'tutorías'}`);
    }

    // Validar categorías específicas
    if (validatedCoupon.category_ids && validatedCoupon.category_ids.length > 0 && categoryId) {
      if (!validatedCoupon.category_ids.includes(categoryId)) {
        throw new Error('Este cupón no es válido para esta categoría');
      }
    }

    // Validar monto mínimo de compra
    if (purchaseAmount < (validatedCoupon.min_purchase_amount ?? 0)) {
      throw new Error(`El monto mínimo de compra para este cupón es $${validatedCoupon.min_purchase_amount ?? 0}`);
    }

    // Validar uso por usuario
    const { data: userUsage } = await supabase
      .from('user_coupons')
      .select('used_count')
      .eq('user_id', userId)
      .eq('coupon_id', couponId)
      .single();

    if (userUsage && (userUsage.used_count ?? 0) >= (validatedCoupon.usage_per_user ?? 0)) {
      throw new Error('Ya has alcanzado el límite de usos para este cupón');
    }

    // Calcular descuento
    let discountAmount = 0;

    if (validatedCoupon.discount_type === 'percentage') {
      discountAmount = (purchaseAmount * validatedCoupon.discount_value) / 100;

      // Aplicar descuento máximo si existe
      if (validatedCoupon.max_discount_amount && discountAmount > validatedCoupon.max_discount_amount) {
        discountAmount = validatedCoupon.max_discount_amount;
      }
    } else {
      // fixed_amount
      discountAmount = Math.min(validatedCoupon.discount_value, purchaseAmount);
    }

    return {
      isValid: true,
      coupon: validatedCoupon,
      discountAmount,
      finalAmount: purchaseAmount - discountAmount,
    };
  } catch (error) {
    console.error('Error validando cupón:', error);
    throw error;
  }
};

// Aplicar (usar) un cupón
export const applyCoupon = async (couponId: string, userId: string) => {
  try {
    // Verificar si ya existe registro de uso
    const { data: existingUsage } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('coupon_id', couponId)
      .single();

    if (existingUsage) {
      // Actualizar contador
      const { data, error } = await supabase
        .from('user_coupons')
        .update({
          used_count: (existingUsage.used_count ?? 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', existingUsage.id)
        .select()
        .single();

      return unwrapData(data, error);
    } else {
      // Crear nuevo registro
      const { data, error } = await supabase
        .from('user_coupons')
        .insert({
          user_id: userId,
          coupon_id: couponId,
          used_count: 1,
          last_used_at: new Date().toISOString(),
        })
        .select()
        .single();

      const userCoupon = unwrapData(data, error);

      // Incrementar contador global del cupón
      const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single();

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ used_count: (coupon.used_count ?? 0) + 1 })
          .eq('id', couponId);
      }

      return userCoupon;
    }
  } catch (error) {
    console.error('Error aplicando cupón:', error);
    throw error;
  }
};

// Canjear un cupón por código
export const redeemCouponByCode = async (
  code: string,
  userId: string,
  applicableTo: 'products' | 'tutoring',
  purchaseAmount: number,
  categoryId?: string
) => {
  try {
    // Buscar cupón por código
    const coupon = await getCouponByCode(code);

    // Validar cupón
    const validation = await validateCoupon(coupon.id, userId, applicableTo, purchaseAmount, categoryId);

    if (!validation.isValid) {
      throw new Error('Cupón no válido');
    }

    // Aplicar cupón
    await applyCoupon(coupon.id, userId);

    return validation;
  } catch (error) {
    console.error('Error canjeando cupón:', error);
    throw error;
  }
};

// Obtener cupones disponibles para un tipo específico
export const getCouponsByType = async (applicableTo: 'products' | 'tutoring' | 'both') => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .or(`applicable_to.eq.${applicableTo},applicable_to.eq.both`)
      .order('discount_value', { ascending: false });

    return unwrapData(data, error);
  } catch (error) {
    console.error('Error obteniendo cupones por tipo:', error);
    throw error;
  }
};
