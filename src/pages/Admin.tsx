import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useSalesStats } from '@/hooks/useSalesStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, Package, Clock, Truck, CheckCircle, XCircle, RefreshCw, Bell, DollarSign, TrendingUp, Calendar, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import PromoCodesManager from '@/components/PromoCodesManager';
import ProductsManager from '@/components/ProductsManager';
import { fr } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-500', icon: Package },
  shipped: { label: 'Expédiée', color: 'bg-purple-500', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-500', icon: XCircle },
};

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: orders, isLoading: ordersLoading, refetch } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const { data: salesStats, isLoading: statsLoading } = useSalesStats();
  const [newOrderNotification, setNewOrderNotification] = useState<{ id: string; customerName: string; total: number } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Real-time subscription for new orders
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as any;
          setNewOrderNotification({
            id: newOrder.id,
            customerName: newOrder.customer_name,
            total: newOrder.total_amount,
          });
          refetch();
          
          // Auto-dismiss notification after 10 seconds
          setTimeout(() => {
            setNewOrderNotification(null);
          }, 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate({ orderId, status });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Administration - Namoussa</title>
      </Helmet>
      
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-secondary" />
              <div>
                <h1 className="font-display text-xl font-semibold">Namoussa Admin</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw size={16} className="mr-2" />
                Actualiser
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* New Order Notification */}
          {newOrderNotification && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Bell className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Nouvelle commande!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {newOrderNotification.customerName} - {newOrderNotification.total.toFixed(2)} DT
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewOrderNotification(null)}
              >
                <XCircle size={18} />
              </Button>
            </div>
          )}

          {/* Sales Stats - Profits et Gains */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : salesStats && (
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-secondary" />
                Statistiques de Ventes & Profits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Chiffre d'affaires total */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Chiffre d'affaires total</p>
                  <p className="text-3xl font-bold">{salesStats.totalRevenue.toFixed(2)} DT</p>
                  <p className="text-xs opacity-75 mt-2">{salesStats.totalOrders} commandes</p>
                </div>

                {/* Revenus du mois */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-8 w-8 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Revenus du mois</p>
                  <p className="text-3xl font-bold">{salesStats.monthlyRevenue.toFixed(2)} DT</p>
                  <p className="text-xs opacity-75 mt-2">{salesStats.monthlyOrders} commandes ce mois</p>
                </div>

                {/* Revenus d'aujourd'hui */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="h-8 w-8 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Revenus aujourd'hui</p>
                  <p className="text-3xl font-bold">{salesStats.todayRevenue.toFixed(2)} DT</p>
                  <p className="text-xs opacity-75 mt-2">{salesStats.todayOrders} commandes aujourd'hui</p>
                </div>

                {/* Panier moyen */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-8 w-8 opacity-80" />
                    <TrendingUp className="h-5 w-5 opacity-80" />
                  </div>
                  <p className="text-sm opacity-90 mb-1">Panier moyen</p>
                  <p className="text-3xl font-bold">{salesStats.averageOrderValue.toFixed(2)} DT</p>
                  <p className="text-xs opacity-75 mt-2">Par commande</p>
                </div>
              </div>

              {/* Stats détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-muted-foreground">Commandes livrées</p>
                  </div>
                  <p className="text-2xl font-bold">{salesStats.deliveredOrders}</p>
                </div>

                <div className="bg-background rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">En attente</p>
                  </div>
                  <p className="text-2xl font-bold">{salesStats.pendingOrders}</p>
                </div>

                <div className="bg-background rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Frais de livraison</p>
                  </div>
                  <p className="text-2xl font-bold">{salesStats.totalDeliveryFees.toFixed(2)} DT</p>
                </div>

                <div className="bg-background rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                    <p className="text-sm text-muted-foreground">Remises totales</p>
                  </div>
                  <p className="text-2xl font-bold text-red-500">-{salesStats.totalDiscounts.toFixed(2)} DT</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats des statuts de commandes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = orders?.filter(o => o.status === status).length || 0;
              const Icon = config.icon;
              return (
                <div key={status} className="bg-background rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              );
            })}
          </div>

          {/* Orders table */}
          <div className="bg-background rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-display text-xl font-semibold">Commandes</h2>
            </div>
            
            {ordersLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const StatusIcon = statusConfig[order.status]?.icon || Clock;
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{order.customer_phone}</p>
                          </TableCell>
                          <TableCell>{order.customer_city}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.order_items?.map((item, i) => (
                                <div key={i}>
                                  {item.quantity}x {item.product_name}
                                  {item.size && ` (${item.size})`}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-secondary">
                            {order.total_amount.toFixed(2)} DT
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon size={14} />
                                    {statusConfig[order.status]?.label || order.status}
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statusConfig).map(([value, config]) => {
                                  const Icon = config.icon;
                                  return (
                                    <SelectItem key={value} value={value}>
                                      <div className="flex items-center gap-2">
                                        <Icon size={14} />
                                        {config.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune commande pour le moment</p>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="mt-8">
            <ProductsManager />
          </div>

          {/* Promo Codes Section */}
          <div className="mt-8">
            <PromoCodesManager />
          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;
