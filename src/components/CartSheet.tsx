import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartSheet = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative p-2 text-foreground hover:text-secondary transition-colors">
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-foreground text-xs rounded-full flex items-center justify-center font-semibold">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Votre Panier</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-body">Votre panier est vide</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                    <img
                      src={item.product.image_url || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-display font-semibold text-foreground">
                        {item.product.name}
                      </h4>
                      {(item.size || item.color) && (
                        <p className="text-sm text-muted-foreground">
                          {item.size && `Taille: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Couleur: ${item.color}`}
                        </p>
                      )}
                      <p className="font-semibold text-secondary mt-1">
                        {item.product.price.toFixed(2)} DT
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-2xl font-semibold text-secondary">
                    {totalPrice.toFixed(2)} DT
                  </span>
                </div>
                <Link to="/checkout">
                  <Button variant="rose" className="w-full" size="lg">
                    Passer la commande
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center">
                  Paiement à la livraison disponible
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
