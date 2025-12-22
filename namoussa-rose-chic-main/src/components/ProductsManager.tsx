import { useState } from 'react';
import { useAllProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Edit, Package, X, Upload, Download, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useExcelImport } from '@/hooks/useExcelImport';
import { useAIFashionModel } from '@/hooks/useAIFashionModel';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAIColorVariants } from '@/hooks/useAIColorVariants';

const ProductsManager = () => {
  const { data: products, isLoading } = useAllProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { generateTemplate, importProducts } = useExcelImport();
  const { generateModelImage, isGenerating } = useAIFashionModel();
  const { uploadImage, isUploading } = useImageUpload();
  const { generateColorVariant, generateMultipleColorVariants, isGenerating: isGeneratingColors } = useAIColorVariants();
  
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    sizes: [] as string[],
    colors: [] as string[],
    in_stock: true,
  });
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [outfitItems, setOutfitItems] = useState<string[]>([]);
  const [outfitItemInput, setOutfitItemInput] = useState('');
  const [colorImages, setColorImages] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      sizes: [],
      colors: [],
      in_stock: true,
    });
    setSizeInput('');
    setColorInput('');
    setOutfitItems([]);
    setOutfitItemInput('');
    setColorImages({});
    setUploadedImageFile(null);
    setUploadedImageUrl('');
    setEditingProduct(null);
  };

  const handleAddOutfitItem = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const url = outfitItemInput.trim();
    
    if (!url) {
      toast.error('Veuillez entrer une URL');
      return;
    }
    
    // Validation basique d'URL
    try {
      new URL(url);
    } catch {
      toast.error('Veuillez entrer une URL valide (commençant par http:// ou https://)');
      return;
    }
    
    if (outfitItems.includes(url)) {
      toast.error('Cette URL a déjà été ajoutée');
      return;
    }
    
    setOutfitItems([...outfitItems, url]);
    setOutfitItemInput('');
    toast.success('Article ajouté avec succès');
  };

  const handleRemoveOutfitItem = (item: string) => {
    setOutfitItems(outfitItems.filter(i => i !== item));
  };

  const handleGenerateModelImage = async () => {
    if (outfitItems.length === 0) {
      toast.error('Veuillez ajouter au moins une image d\'article');
      return;
    }

    const items = outfitItems.map(url => ({ url }));
    const generatedImageUrl = await generateModelImage(items);
    
    if (generatedImageUrl) {
      setFormData({ ...formData, image_url: generatedImageUrl });
      toast.success('Image de modèle générée et ajoutée!');
    }
  };

  const handleOpenDialog = (product?: Product) => {
    try {
      if (product) {
        setEditingProduct(product);
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          image_url: product.image_url || '',
          category_id: product.category_id || '',
          sizes: product.sizes || [],
          colors: product.colors || [],
          in_stock: product.in_stock,
        });
        setColorImages(product.color_images || {});
        setOutfitItems([]);
        setOutfitItemInput('');
      } else {
        resetForm();
      }
      setIsOpen(true);
      console.log('Dialog state set to open:', true);
    } catch (error) {
      console.error('Error in handleOpenDialog:', error);
      toast.error('Erreur lors de l\'ouverture du formulaire');
    }
  };

  const handleNewProductClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('Opening dialog for new product');
      resetForm();
      setEditingProduct(null);
      setIsOpen(true);
    } catch (error) {
      console.error('Error opening new product dialog:', error);
      toast.error('Erreur lors de l\'ouverture du formulaire');
    }
  };

  const handleAddSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
      setSizeInput('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
  };

  const handleAddColor = async () => {
    const newColor = colorInput.trim();
    if (newColor && !formData.colors.includes(newColor)) {
      const updatedColors = [...formData.colors, newColor];
      setFormData({ ...formData, colors: updatedColors });
      setColorInput('');
      
      // Auto-générer la variante de couleur si une image est disponible
      if (uploadedImageUrl || formData.image_url) {
        const baseImageUrl = uploadedImageUrl || formData.image_url;
        if (baseImageUrl) {
          // Générer la variante pour la nouvelle couleur
          const variantUrl = await generateColorVariant(baseImageUrl, newColor);
          if (variantUrl) {
            setColorImages({ ...colorImages, [newColor]: variantUrl });
          }
        }
      }
    }
  };

  const handleRemoveColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) });
    // Remove the image for this color if it exists
    const newColorImages = { ...colorImages };
    delete newColorImages[color];
    setColorImages(newColorImages);
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImageFile(file);
    
    // Afficher un aperçu local
    const reader = new FileReader();
    reader.onload = async (event) => {
      const url = event.target?.result as string;
      setUploadedImageUrl(url);
      setFormData({ ...formData, image_url: url });
      
      // Auto-générer les variantes pour les couleurs déjà ajoutées
      if (formData.colors.length > 0) {
        toast.info('Génération automatique des variantes de couleur...');
        const variants = await generateMultipleColorVariants(url, formData.colors);
        if (Object.keys(variants).length > 0) {
          setColorImages(variants);
          toast.success(`${Object.keys(variants).length} variante(s) générée(s) automatiquement!`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadToSupabase = async () => {
    if (!uploadedImageFile) {
      toast.error('Aucune image à uploader');
      return;
    }

    const uploadedUrl = await uploadImage(uploadedImageFile);
    if (uploadedUrl) {
      setUploadedImageUrl(uploadedUrl);
      setFormData({ ...formData, image_url: uploadedUrl });
      
      // Auto-générer les variantes pour les couleurs déjà ajoutées
      if (formData.colors.length > 0) {
        toast.info('Génération automatique des variantes de couleur...');
        const variants = await generateMultipleColorVariants(uploadedUrl, formData.colors);
        if (Object.keys(variants).length > 0) {
          setColorImages(variants);
          toast.success(`${Object.keys(variants).length} variante(s) générée(s) automatiquement!`);
        }
      }
    }
  };

  const handleGenerateColorVariants = async () => {
    if (!uploadedImageUrl && !formData.image_url) {
      toast.error('Veuillez d\'abord uploader une image');
      return;
    }

    if (formData.colors.length === 0) {
      toast.error('Veuillez d\'abord ajouter des couleurs');
      return;
    }

    const baseImageUrl = uploadedImageUrl || formData.image_url;
    if (!baseImageUrl) {
      toast.error('Aucune image disponible');
      return;
    }

    toast.info('Génération des variantes de couleur en cours...');
    const variants = await generateMultipleColorVariants(baseImageUrl, formData.colors);
    
    if (Object.keys(variants).length > 0) {
      setColorImages(variants);
      toast.success(`${Object.keys(variants).length} variante(s) de couleur générée(s)!`);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.name.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('Le prix doit être un nombre positif');
      return;
    }
    
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        price: parseFloat(formData.price),
        image_url: formData.image_url?.trim() || undefined,
        category_id: formData.category_id || null,
        sizes: formData.sizes || [],
        colors: formData.colors || [],
        color_images: Object.keys(colorImages).length > 0 ? colorImages : undefined,
        in_stock: formData.in_stock ?? true,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          ...productData,
        });
      } else {
        await createProduct.mutateAsync(productData);
      }
      
      resetForm();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error submitting product:', error);
      toast.error(error?.message || 'Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      deleteProduct.mutate(id);
    }
  };

  const handleDownloadTemplate = () => {
    if (categories && categories.length > 0) {
      generateTemplate(categories);
    } else {
      toast.error('Veuillez attendre le chargement des catégories');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    if (categories && categories.length > 0) {
      importProducts.mutate({ file, categories });
    } else {
      toast.error('Veuillez attendre le chargement des catégories');
    }

    // Réinitialiser l'input
    e.target.value = '';
  };

  // Debug: vérifier l'état
  console.log('=== ProductsManager RENDER ===');
  console.log('isOpen:', isOpen);
  console.log('editingProduct:', editingProduct);
  console.log('Dialog should be', isOpen ? 'OPEN' : 'CLOSED');

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-secondary" />
          <h2 className="font-display text-xl font-semibold">Produits</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={!categories || categories.length === 0}
          >
            <Download size={16} className="mr-2" />
            Télécharger template
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={importProducts.isPending || !categories || categories.length === 0}
            />
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              disabled={importProducts.isPending || !categories || categories.length === 0}
              onClick={(e) => {
                e.preventDefault();
                const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                input?.click();
              }}
            >
              <Upload size={16} className="mr-2" />
              {importProducts.isPending ? 'Import en cours...' : 'Importer Excel'}
            </Button>
          </label>
          <Button 
            variant="rose" 
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('=== BUTTON CLICKED ===');
              console.log('Current isOpen state:', isOpen);
              resetForm();
              setEditingProduct(null);
              console.log('Calling setIsOpen(true)...');
              setIsOpen(true);
              console.log('isOpen should now be true');
            }}
          >
            <Plus size={16} className="mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange called with:', open);
          setIsOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifiez les informations du produit ci-dessous.' : 'Remplissez le formulaire ci-dessous pour ajouter un nouveau produit à votre catalogue.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nom du produit *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Robe élégante"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du produit..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prix (DT) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="ex: 89.99"
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={formData.category_id || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <Label className="text-base font-semibold">Générer une image de modèle avec IA</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez les URLs des images des articles (haut, bas, chaussures, accessoires) pour créer une tenue complète sur un modèle IA.
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={outfitItemInput}
                      onChange={(e) => setOutfitItemInput(e.target.value)}
                      placeholder="https://... (URL de l'image d'un article)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOutfitItem();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => handleAddOutfitItem(e)}
                      disabled={!outfitItemInput.trim()}
                    >
                      <Plus size={16} className="mr-2" />
                      Ajouter
                    </Button>
                  </div>
                  {outfitItems.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Articles ajoutés ({outfitItems.length}):</div>
                      <div className="grid grid-cols-2 gap-2">
                        {outfitItems.map((item, index) => (
                          <div key={index} className="relative border rounded p-2">
                            <img
                              src={item}
                              alt={`Article ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">Image invalide</div>`;
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-destructive"
                              onClick={() => handleRemoveOutfitItem(item)}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="rose"
                          onClick={handleGenerateModelImage}
                          disabled={isGenerating || outfitItems.length === 0}
                          className="flex-1"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} className="mr-2" />
                              Générer l'image du modèle
                            </>
                          )}
                        </Button>
                      </div>
                      {outfitItems.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          💡 Astuce: Ajoutez plusieurs articles (haut, bas, chaussures) pour créer une tenue complète.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Uploader une image depuis votre PC</Label>
                  <div className="flex gap-2 mt-2">
                    <label className="cursor-pointer flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Upload size={16} className="mr-2" />
                          Choisir une image
                        </span>
                      </Button>
                    </label>
                    {uploadedImageFile && (
                      <Button
                        type="button"
                        variant="rose"
                        onClick={handleUploadToSupabase}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Upload...
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="mr-2" />
                            Uploader
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {uploadedImageUrl && (
                    <div className="mt-2">
                      <img
                        src={uploadedImageUrl}
                        alt="Aperçu upload"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                
                {uploadedImageUrl && formData.colors.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-secondary" />
                      <Label className="text-base font-semibold">Générer des variantes de couleur avec IA</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Générez automatiquement des images pour chaque couleur à partir de l'image uploadée.
                    </p>
                    <Button
                      type="button"
                      variant="rose"
                      onClick={handleGenerateColorVariants}
                      disabled={isGeneratingColors || formData.colors.length === 0}
                      className="w-full"
                    >
                      {isGeneratingColors ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="mr-2" />
                          Générer les variantes de couleur
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <div>
                  <Label>URL de l'image (ou utilisez l'image uploadée/générée ci-dessus)</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://... ou image générée par IA"
                  />
                  {formData.image_url && !uploadedImageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label>Tailles disponibles</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="ex: S, M, L, XL"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddSize}>
                  Ajouter
                </Button>
              </div>
              {formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <Badge key={size} variant="secondary" className="flex items-center gap-1">
                      {size}
                      <X
                        size={12}
                        className="cursor-pointer"
                        onClick={() => handleRemoveSize(size)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label>Couleurs disponibles</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  placeholder="ex: Rouge, Bleu, Noir"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddColor}>
                  Ajouter
                </Button>
              </div>
              {formData.colors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color) => (
                      <Badge key={color} variant="secondary" className="flex items-center gap-1">
                        {color}
                        {colorImages[color] && (
                          <CheckCircle size={12} className="text-green-500" />
                        )}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={() => handleRemoveColor(color)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Aperçu des variantes générées */}
                  {Object.keys(colorImages).length > 0 && (
                    <div className="pt-2 border-t">
                      <Label className="text-sm font-semibold mb-2 block">
                        Variantes générées par IA ({Object.keys(colorImages).length}/{formData.colors.length})
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formData.colors.map((color) => {
                          if (!colorImages[color]) return null;
                          return (
                            <div key={color} className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{color}</Label>
                              <div className="relative">
                                <img
                                  src={colorImages[color]}
                                  alt={`${color} variant`}
                                  className="w-full h-24 object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                {isGeneratingColors && (
                                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <Loader2 size={16} className="animate-spin text-secondary" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {formData.colors.length > Object.keys(colorImages).length && (
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Les variantes sont générées automatiquement. Uploader l'image pour générer les variantes manquantes.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Bouton pour régénérer toutes les variantes */}
                  {(uploadedImageUrl || formData.image_url) && formData.colors.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateColorVariants}
                        disabled={isGeneratingColors}
                        className="w-full"
                      >
                        {isGeneratingColors ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Régénération en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="mr-2" />
                            Régénérer toutes les variantes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
              />
              <Label>En stock</Label>
            </div>
            
            <Button 
              variant="rose" 
              className="w-full"
              onClick={handleSubmit}
              disabled={
                (createProduct.isPending || updateProduct.isPending) || 
                !formData.name || 
                !formData.price
              }
            >
              {createProduct.isPending || updateProduct.isPending
                ? 'Traitement...'
                : editingProduct
                ? 'Modifier'
                : 'Créer le produit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Tailles</TableHead>
                <TableHead>Couleurs</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Package size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-secondary">
                    {product.price.toFixed(2)} DT
                  </TableCell>
                  <TableCell>
                    {product.sizes && product.sizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.slice(0, 3).map((size) => (
                          <Badge key={size} variant="secondary" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                        {product.sizes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{product.sizes.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.colors && product.colors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.colors.slice(0, 3).map((color) => (
                          <Badge key={color} variant="secondary" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                        {product.colors.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{product.colors.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                      {product.in_stock ? 'En stock' : 'Rupture'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(product.created_at), 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun produit</p>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;

