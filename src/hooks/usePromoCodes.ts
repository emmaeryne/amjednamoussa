import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const usePromoCodes = () => {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    },
  });
};

export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async ({ code, orderAmount }: { code: string; orderAmount: number }) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        throw new Error('Code promo invalide');
      }
      
      const promo = data as PromoCode;
      
      // Check expiration
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        throw new Error('Ce code promo a expiré');
      }
      
      // Check max uses
      if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        throw new Error('Ce code promo a atteint sa limite d\'utilisation');
      }
      
      // Check minimum order amount
      if (orderAmount < promo.min_order_amount) {
        throw new Error(`Commande minimum de ${promo.min_order_amount} DT requise`);
      }
      
      // Calculate discount
      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (orderAmount * promo.discount_value) / 100;
      } else {
        discountAmount = Math.min(promo.discount_value, orderAmount);
      }
      
      return {
        promo,
        discountAmount,
      };
    },
  });
};

interface CreatePromoCodeData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  expires_at?: string;
}

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePromoCodeData) => {
      const { data: promo, error } = await supabase
        .from('promo_codes')
        .insert({
          code: data.code.toUpperCase(),
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          min_order_amount: data.min_order_amount || 0,
          max_uses: data.max_uses || null,
          expires_at: data.expires_at || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return promo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Code promo créé avec succès');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ce code promo existe déjà');
      } else {
        toast.error('Erreur lors de la création');
      }
    },
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Code promo mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      toast.success('Code promo supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
};

export const useIncrementPromoCodeUse = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data: promo, error: fetchError } = await supabase
        .from('promo_codes')
        .select('current_uses')
        .eq('code', code.toUpperCase())
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('promo_codes')
        .update({ current_uses: (promo?.current_uses || 0) + 1 })
        .eq('code', code.toUpperCase());
      
      if (error) throw error;
    },
  });
};
