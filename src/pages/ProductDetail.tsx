import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ArrowLeft, Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || '');
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Fonction helper pour obtenir l'image selon la couleur
  const getImageForColor = (color: string | null): string => {
    if (!color || !product) {
      return product?.image_url || '/placeholder.svg';
    }

    // Debug: afficher les données
    console.log('getImageForColor called with:', { color, color_images: product.color_images });

    if (!product.color_images) {
      console.log('No color_images found, using default image');
      return product.image_url || '/placeholder.svg';
    }

    // Parser color_images si c'est une string
    let colorImagesObj: Record<string, string> | null = null;
    
    if (typeof product.color_images === 'string') {
      try {
        colorImagesObj = JSON.parse(product.color_images);
      } catch (e) {
        console.error('Error parsing color_images:', e);
        return product.image_url || '/placeholder.svg';
      }
    } else if (typeof product.color_images === 'object' && product.color_images !== null) {
      colorImagesObj = product.color_images as Record<string, string>;
    }

    if (!colorImagesObj || Object.keys(colorImagesObj).length === 0) {
      console.log('colorImagesObj is empty, using default image');
      return product.image_url || '/placeholder.svg';
    }

    console.log('Available color keys:', Object.keys(colorImagesObj));
    console.log('Looking for color:', color);

    // Chercher l'image pour la couleur (insensible à la casse)
    // Essayer d'abord avec le nom exact
    if (colorImagesObj[color]) {
      console.log('Found exact match:', colorImagesObj[color]);
      return colorImagesObj[color];
    }

    // Essayer avec différentes variations de casse
    const colorKey = Object.keys(colorImagesObj).find(
      key => key.toLowerCase() === color.toLowerCase()
    );

    if (colorKey && colorImagesObj[colorKey]) {
      console.log('Found case-insensitive match:', colorKey, colorImagesObj[colorKey]);
      return colorImagesObj[colorKey];
    }

    console.log('No match found, using default image');
    // Retourner l'image par défaut si aucune correspondance
    return product.image_url || '/placeholder.svg';
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }
    
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    toast.success(`${product.name} ajouté au panier`);
  };

  const incrementQuantity = () => {
    setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Chargement... - Namoussa</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-24 pb-20">
            <div className="container mx-auto px-4 md:px-8">
              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <Skeleton className="h-[600px] w-full" />
                <div className="space-y-6">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Produit introuvable - Namoussa</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-24 pb-20">
            <div className="container mx-auto px-4 text-center">
              <Package size={64} className="mx-auto text-muted-foreground mb-4" />
              <h1 className="font-display text-3xl font-semibold mb-4">Produit introuvable</h1>
              <p className="text-muted-foreground mb-6">
                Le produit que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button variant="rose" onClick={() => navigate('/')}>
                Retour à l'accueil
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
        <title>{product.name} - Namoussa | Prêt-à-porter Femme</title>
        <meta name="description" content={product.description || product.name} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft size={18} className="mr-2" />
              Retour
            </Button>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Image */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={getImageForColor(selectedColor)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    key={`${selectedColor || 'default'}-${product.id}`} // Force re-render when color changes
                  />
                  {!product.in_stock && (
                    <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm font-semibold">
                      Rupture de stock
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category badge */}
                {product.category && (
                  <Link to={`/${product.category.slug}`}>
                    <Badge variant="outline" className="text-sm">
                      {product.category.name}
                    </Badge>
                  </Link>
                )}

                {/* Name */}
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="font-display text-3xl font-semibold text-secondary">
                    {product.price.toFixed(2)} DT
                  </span>
                  {product.in_stock && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle size={14} className="mr-1" />
                      En stock
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-2">Description</h3>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-3">Taille</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSize(size)}
                          className="min-w-[60px]"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-semibold mb-3">Couleur</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <Button
                          key={color}
                          variant={selectedColor === color ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            console.log('Color selected:', color);
                            console.log('Product color_images:', product.color_images);
                            setSelectedColor(color);
                          }}
                        >
                          {color}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h3 className="font-display text-lg font-semibold mb-3">Quantité</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="font-display text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Add to cart button */}
                <Button
                  variant="rose"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingBag size={20} className="mr-2" />
                  {product.in_stock ? 'Ajouter au panier' : 'Rupture de stock'}
                </Button>

                {/* Product details */}
                <div className="pt-6 border-t space-y-2 text-sm text-muted-foreground">
                  <p>✓ Livraison gratuite à partir de 200 DT</p>
                  <p>✓ Paiement à la livraison</p>
                  <p>✓ Retours gratuits sous 14 jours</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;

