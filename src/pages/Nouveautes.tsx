import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useAllProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

const Nouveautes = () => {
  const { data: products, isLoading } = useAllProducts();
  
  // État pour le tri par prix
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  // Filtrer pour ne garder que les produits récents (30 derniers jours) et trier
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    // Filtrer les produits récents (ajoutés dans les 30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let filtered = products.filter(product => {
      const productDate = new Date(product.created_at);
      return productDate >= thirtyDaysAgo;
    });
    
    // Si aucun produit récent, prendre les 20 plus récents
    if (filtered.length === 0) {
      filtered = products.slice(0, 20);
    }
    
    // Trier par prix si demandé
    if (sortOrder === 'asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    
    // Par défaut, trier par date de création (plus récent en premier)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [products, sortOrder]);

  // Réinitialiser le tri
  const resetFilter = () => {
    setSortOrder('none');
  };

  // Vérifier si le tri est actif
  const isFilterActive = sortOrder !== 'none';

  return (
    <>
      <Helmet>
        <title>Nouvelle Arrivée - Namoussa | Prêt-à-porter Femme Tunisie</title>
        <meta name="description" content="Découvrez nos nouvelles arrivées - les produits récemment ajoutés à notre collection" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-secondary" />
                <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary">
                  Nouvelle Arrivée
                </p>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Nos Dernières Arrivées
              </h1>
              <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                Découvrez les produits récemment ajoutés à notre collection. Des pièces tendance et élégantes pour sublimer votre garde-robe.
              </p>
            </div>

            {/* Sort by Price */}
            {!isLoading && products && products.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Trier par prix
                    </CardTitle>
                    {isFilterActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilter}
                        className="h-8 px-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Réinitialiser
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tri par prix */}
                    <div className="space-y-2">
                      <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'none' | 'asc' | 'desc')}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un tri" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <span>Plus récents d'abord</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="asc">
                            <div className="flex items-center gap-2">
                              <ArrowUp className="h-4 w-4" />
                              <span>Prix croissant</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="desc">
                            <div className="flex items-center gap-2">
                              <ArrowDown className="h-4 w-4" />
                              <span>Prix décroissant</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Résumé */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">
                        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} récent{filteredProducts.length > 1 ? 's' : ''}
                      </span>
                      {isFilterActive && (
                        <div className="flex items-center gap-2 text-secondary font-medium">
                          {sortOrder === 'asc' ? (
                            <>
                              <ArrowUp className="h-3 w-3" />
                              <span>Prix croissant</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-3 w-3" />
                              <span>Prix décroissant</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-72 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body text-lg">
                  Aucun nouveau produit pour le moment.
                </p>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Consultez nos autres catégories ou revenez bientôt pour découvrir nos nouveautés.
                </p>
                <Button variant="elegant" onClick={() => window.location.href = '/'}>
                  Retour à l'accueil
                </Button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Nouveautes;

