import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
}

const featuredProducts: FeaturedProduct[] = [
  {
    id: "featured-1",
    name: "Robe Midi Élégante",
    price: 149,
    originalPrice: 189,
    image: product1,
    badge: "Nouveau",
  },
  {
    id: "featured-2",
    name: "Blouse Satin Rose",
    price: 79,
    originalPrice: null,
    image: product2,
    badge: null,
  },
  {
    id: "featured-3",
    name: "Ensemble Blazer Noir",
    price: 259,
    originalPrice: 329,
    image: product3,
    badge: "-20%",
  },
  {
    id: "featured-4",
    name: "Pantalon Palazzo Crème",
    price: 99,
    originalPrice: null,
    image: product4,
    badge: "Best Seller",
  },
];

const FeaturedProducts = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: FeaturedProduct) => {
    // Convert to Product type for cart
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image,
      description: null,
      category_id: null,
      sizes: [],
      colors: [],
      in_stock: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    addToCart(cartProduct);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-rose">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-4">
            Sélection
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Nos Best-Sellers
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Les pièces préférées de nos clientes, sélectionnées avec soin pour vous.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Image container */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-secondary text-foreground px-3 py-1 text-xs font-body uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}


                {/* Quick add button */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Button
                    variant="elegant"
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    Ajouter au panier
                  </Button>
                </div>
              </div>

              {/* Product info */}
              <div className="p-4">
                <h3 className="font-display text-lg font-medium text-foreground mb-2 group-hover:text-secondary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-body text-lg font-semibold text-foreground">
                    {product.price} DT
                  </span>
                  {product.originalPrice && (
                    <span className="font-body text-sm text-muted-foreground line-through">
                      {product.originalPrice} DT
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Link to="/category/robes">
            <Button variant="heroOutline" size="lg">
              Voir Toute la Collection
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
