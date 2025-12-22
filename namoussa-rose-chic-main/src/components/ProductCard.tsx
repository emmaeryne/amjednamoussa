import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500">
      {/* Image */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <Link to={`/produit/${product.id}`}>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Eye size={18} />
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full"
            onClick={handleAddToCart}
            disabled={!product.in_stock}
          >
            <ShoppingBag size={18} />
          </Button>
        </div>

        {/* Out of stock badge */}
        {!product.in_stock && (
          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
            Rupture de stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 truncate">
          {product.name}
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-secondary">
            {product.price.toFixed(2)} DT
          </span>
          <Button 
            variant="rose" 
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.in_stock}
          >
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
