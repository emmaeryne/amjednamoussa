import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems } from '@/types';

export interface SalesStats {
  totalRevenue: number; // Chiffre d'affaires total
  totalOrders: number; // Nombre total de commandes
  deliveredOrders: number; // Commandes livrées
  pendingOrders: number; // Commandes en attente
  averageOrderValue: number; // Valeur moyenne par commande
  monthlyRevenue: number; // Revenus du mois en cours
  monthlyOrders: number; // Commandes du mois
  todayRevenue: number; // Revenus d'aujourd'hui
  todayOrders: number; // Commandes d'aujourd'hui
  totalDeliveryFees: number; // Total des frais de livraison
  totalDiscounts: number; // Total des remises
  netRevenue: number; // Revenus nets (après remises)
}

export const useSalesStats = () => {
  return useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersData = orders as OrderWithItems[];

      // Date du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Début du mois
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Filtrer les commandes
      const allOrders = ordersData;
      const deliveredOrders = ordersData.filter(o => o.status === 'delivered');
      const pendingOrders = ordersData.filter(o => o.status === 'pending');
      const monthlyOrders = ordersData.filter(
        o => new Date(o.created_at) >= startOfMonth
      );
      const todayOrders = ordersData.filter(
        o => new Date(o.created_at) >= today
      );

      // Calculer les revenus
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

      // Calculer les frais de livraison
      const totalDeliveryFees = allOrders.reduce(
        (sum, order) => sum + (order.delivery_fee || 0),
        0
      );

      // Calculer les remises
      const totalDiscounts = allOrders.reduce(
        (sum, order) => sum + (order.discount_amount || 0),
        0
      );

      // Revenus nets (total - remises)
      const netRevenue = totalRevenue;

      // Valeur moyenne par commande
      const averageOrderValue = allOrders.length > 0 
        ? totalRevenue / allOrders.length 
        : 0;

      const stats: SalesStats = {
        totalRevenue,
        totalOrders: allOrders.length,
        deliveredOrders: deliveredOrders.length,
        pendingOrders: pendingOrders.length,
        averageOrderValue,
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        todayRevenue,
        todayOrders: todayOrders.length,
        totalDeliveryFees,
        totalDiscounts,
        netRevenue,
      };

      return stats;
    },
  });
};

