import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
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
import { X, Filter, ArrowUp, ArrowDown } from 'lucide-react';

const categoryNames: Record<string, string> = {
  robes: 'Robes',
  ensembles: 'Ensembles',
  chemises: 'Chemises',
  pantalons: 'Pantalons',
  vestes: 'Vestes',
  hijab: 'Hijab & Foulards',
  sacs: 'Sacs',
  talons: 'Talons',
  top: 'Tops',
  pulls: 'Pulls',
};

const categoryDescriptions: Record<string, string> = {
  robes: 'Découvrez notre collection de robes élégantes - midi, casual et soirée',
  ensembles: 'Ensembles coordonnés pantalon + top, jupe + chemise',
  chemises: 'Chemises et blouses en satin, oversize et coton léger',
  pantalons: 'Pantalons larges, palazzo et taille haute',
  vestes: 'Blazers, vestes en jean et kimonos',
  hijab: 'Hijabs et foulards élégants et confortables',
  sacs: 'Sacs tendance pour toutes les occasions',
  talons: 'Talons élégants pour sublimer vos tenues',
  top: 'Tops et débardeurs élégants pour toutes les occasions',
  pulls: 'Pulls et tricots doux et confortables',
};

const CategoryPage = () => {
  const location = useLocation();
  // Extraire le slug depuis l'URL (ex: /robes -> robes)
  const slug = location.pathname.replace('/', '') || undefined;
  const { data: products, isLoading } = useProducts(slug);
  
  const categoryName = slug ? categoryNames[slug] || slug : 'Collection';
  const categoryDescription = slug ? categoryDescriptions[slug] || '' : '';

  // État pour le tri par prix
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  // Trier les produits par prix
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    // Trier par prix
    if (sortOrder === 'asc') {
      return [...products].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      return [...products].sort((a, b) => b.price - a.price);
    }
    
    return products;
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
        <title>{categoryName} - Namoussa | Prêt-à-porter Femme Tunisie</title>
        <meta name="description" content={categoryDescription} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-4">
                Collection
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                {categoryName}
              </h1>
              {categoryDescription && (
                <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                  {categoryDescription}
                </p>
              )}
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
                              <span>Aucun tri</span>
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
                        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
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
                  Aucun produit disponible pour le moment.
                </p>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Consultez nos autres catégories ou contactez-nous pour plus d'informations.
                </p>
                <Link to="/contact">
                  <Button variant="elegant">Nous contacter</Button>
                </Link>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;
