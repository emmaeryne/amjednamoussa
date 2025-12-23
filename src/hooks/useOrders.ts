import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderWithItems, CartItem } from '@/types';
import { toast } from 'sonner';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Sort by status priority: pending first, then by date (newest first)
      const sorted = (data as OrderWithItems[]).sort((a, b) => {
        const statusOrder: Record<string, number> = {
          'pending': 0,
          'confirmed': 1,
          'shipped': 2,
          'delivered': 3,
          'cancelled': 4,
        };
        
        const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        if (statusDiff !== 0) return statusDiff;
        
        // If same status, sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return sorted;
    },
  });
};

interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  notes?: string;
  items: CartItem[];
  delivery_fee: number;
  promo_code: string | null;
  discount_amount: number;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      // Validate required fields
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Le panier est vide');
      }
      
      if (!orderData.customer_name || !orderData.customer_email || !orderData.customer_phone || 
          !orderData.customer_address || !orderData.customer_city) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }
      
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );
      
      if (subtotal <= 0) {
        throw new Error('Le montant total doit être supérieur à 0');
      }
      
      const totalAmount = subtotal + (orderData.delivery_fee || 0) - (orderData.discount_amount || 0);
      
      // Ensure total amount is not negative
      const finalTotal = Math.max(0, totalAmount);
      
      // Prepare order data with proper types
      const orderInsert = {
        customer_name: orderData.customer_name.trim(),
        customer_email: orderData.customer_email.trim(),
        customer_phone: orderData.customer_phone.trim(),
        customer_address: orderData.customer_address.trim(),
        customer_city: orderData.customer_city.trim(),
        notes: orderData.notes?.trim() || null,
        total_amount: Number(finalTotal.toFixed(2)),
        delivery_fee: Number((orderData.delivery_fee || 0).toFixed(2)),
        promo_code: orderData.promo_code?.trim() || null,
        discount_amount: Number((orderData.discount_amount || 0).toFixed(2)),
        payment_method: 'cash_on_delivery',
        status: 'pending',
      };
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single();
      
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Erreur lors de la création de la commande');
      }
      
      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id || null,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(itemsError.message || 'Erreur lors de la création des articles de commande');
      }

      // Increment promo code usage if used
      if (orderData.promo_code) {
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('current_uses')
          .eq('code', orderData.promo_code)
          .single();
        
        if (promo) {
          await supabase
            .from('promo_codes')
            .update({ current_uses: promo.current_uses + 1 })
            .eq('code', orderData.promo_code);
        }
      }
      
      // Send confirmation emails via edge function
      try {
        await supabase.functions.invoke('send-order-email', {
          body: {
            orderId: order.id,
            customerEmail: orderData.customer_email,
            customerName: orderData.customer_name,
            customerPhone: orderData.customer_phone,
            customerAddress: orderData.customer_address,
            customerCity: orderData.customer_city,
            items: orderData.items.map(item => ({
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              size: item.size || null,
              color: item.color || null,
            })),
            subtotal,
            deliveryFee: orderData.delivery_fee,
            discountAmount: orderData.discount_amount,
            promoCode: orderData.promo_code || null,
            totalAmount: finalTotal,
          },
        });
      } catch (e) {
        console.error('Failed to send email:', e);
        // Don't throw - email failure shouldn't prevent order creation
      }
      
      return order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Commande créée avec succès!');
    },
    onError: (error: any) => {
      console.error('Order error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Erreur lors de la création de la commande';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });
};
