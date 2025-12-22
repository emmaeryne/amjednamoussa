import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useValidatePromoCode } from '@/hooks/usePromoCodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Truck, CreditCard, CheckCircle, Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DELIVERY_FEE = 7;

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Nom requis'),
  customer_email: z.string().email('Email invalide'),
  customer_phone: z.string().min(8, 'Numéro de téléphone requis'),
  customer_address: z.string().min(5, 'Adresse requise'),
  customer_city: z.string().min(2, 'Ville requise'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const validatePromoCode = useValidatePromoCode();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      customer_city: '',
      notes: '',
    },
  });

  const subtotal = totalPrice;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const finalTotal = subtotal + DELIVERY_FEE - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Veuillez entrer un code promo');
      return;
    }

    try {
      const result = await validatePromoCode.mutateAsync({
        code: promoCode,
        orderAmount: subtotal,
      });
      setAppliedPromo({
        code: result.promo.code,
        discountAmount: result.discountAmount,
      });
      toast.success(`Code promo appliqué: -${result.discountAmount.toFixed(2)} DT`);
    } catch (error: any) {
      toast.error(error.message || 'Code promo invalide');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    const order = await createOrder.mutateAsync({
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      customer_city: data.customer_city,
      notes: data.notes,
      items,
      delivery_fee: DELIVERY_FEE,
      promo_code: appliedPromo?.code || null,
      discount_amount: discountAmount,
    });
    setOrderId(order.id);
    setOrderSuccess(true);
    clearCart();
  };

  if (orderSuccess) {
    return (
      <>
        <Helmet>
          <title>Commande Confirmée - Namoussa</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-lg">
              <div className="text-center py-20">
                <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
                <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
                  Commande Confirmée!
                </h1>
                <p className="text-muted-foreground mb-2">
                  Merci pour votre commande. Vous recevrez un email de confirmation.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Numéro de commande: <span className="font-mono">{orderId?.slice(0, 8)}</span>
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-3 text-left">
                    <Truck className="text-secondary" />
                    <div>
                      <p className="font-semibold">Paiement à la livraison</p>
                      <p className="text-sm text-muted-foreground">
                        Payez en espèces lors de la réception
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="rose" onClick={() => navigate('/')}>
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Panier Vide - Namoussa</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-24 pb-20">
            <div className="container mx-auto px-4 text-center py-20">
              <h1 className="font-display text-3xl font-semibold text-foreground mb-4">
                Votre panier est vide
              </h1>
              <Button variant="rose" onClick={() => navigate('/')}>
                Continuer vos achats
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Namoussa | Prêt-à-porter Femme</title>
        <meta name="description" content="Finalisez votre commande - Paiement à la livraison" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground text-center mb-12">
              Finaliser la Commande
            </h1>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Order summary */}
              <div className="order-2 lg:order-1">
                <h2 className="font-display text-xl font-semibold mb-6">Récapitulatif</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantité: {item.quantity}
                          {item.size && ` | Taille: ${item.size}`}
                        </p>
                        <p className="font-semibold text-secondary">
                          {(item.product.price * item.quantity).toFixed(2)} DT
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Promo code section */}
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={18} className="text-secondary" />
                    <span className="font-semibold">Code promo</span>
                  </div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div>
                        <span className="font-mono font-semibold text-green-700 dark:text-green-400">
                          {appliedPromo.code}
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-500 ml-2">
                          (-{appliedPromo.discountAmount.toFixed(2)} DT)
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemovePromo}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Entrez votre code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={validatePromoCode.isPending}
                      >
                        {validatePromoCode.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          'Appliquer'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="border-t mt-6 pt-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mt-2">
                    <span>Livraison</span>
                    <span>{DELIVERY_FEE.toFixed(2)} DT</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600 mt-2">
                      <span>Réduction</span>
                      <span>-{discountAmount.toFixed(2)} DT</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-semibold mt-4 pt-4 border-t">
                    <span>Total</span>
                    <span className="text-secondary">{finalTotal.toFixed(2)} DT</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-secondary" />
                    <div>
                      <p className="font-semibold">Paiement à la livraison</p>
                      <p className="text-sm text-muted-foreground">
                        Payez en espèces à la réception de votre commande
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout form */}
              <div className="order-1 lg:order-2">
                <h2 className="font-display text-xl font-semibold mb-6">Informations de livraison</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="XX XXX XXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse de livraison</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Rue, numéro, appartement..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customer_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Tunis, Sfax, Sousse..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optionnel)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Instructions spéciales..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      variant="rose" 
                      className="w-full" 
                      size="lg"
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? 'Traitement...' : `Confirmer (${finalTotal.toFixed(2)} DT)`}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Checkout;
