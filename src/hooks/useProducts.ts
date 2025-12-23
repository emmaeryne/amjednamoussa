import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { toast } from 'sonner';

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, category:categories(*)');
      
      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Product & { category: Category | null })[];
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Product & { category: Category | null })[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', productId)
        .maybeSingle();
      
      if (error) throw error;
      return data as (Product & { category: Category | null }) | null;
    },
    enabled: !!productId,
  });
};

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: string | null;
  sizes: string[];
  colors: string[];
  color_images?: Record<string, string>;
  in_stock: boolean;
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      // Préparer les données d'insertion
      const insertData: any = {
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: data.image_url || null,
        category_id: data.category_id || null,
        sizes: data.sizes || [],
        colors: data.colors || [],
        in_stock: data.in_stock ?? true,
      };
      
      // Ajouter color_images si défini (maintenant que la colonne existe)
      if (data.color_images && Object.keys(data.color_images).length > 0) {
        insertData.color_images = data.color_images;
      }
      
      const { data: product, error } = await supabase
        .from('products')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return product as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit créé avec succès');
    },
    onError: (error: any) => {
      console.error('Product creation error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Erreur lors de la création du produit';
      toast.error(errorMessage);
    },
  });
};

interface UpdateProductData {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_id?: string | null;
  sizes?: string[];
  colors?: string[];
  color_images?: Record<string, string>;
  in_stock?: boolean;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProductData) => {
      const { id, ...updateData } = data;
      
      // Mettre à jour avec toutes les données, y compris color_images
      const { data: product, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return product as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit mis à jour');
    },
    onError: (error: any) => {
      console.error('Product update error:', error);
      const errorMessage = error?.message || error?.error?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit supprimé');
    },
    onError: (error) => {
      console.error('Product deletion error:', error);
      toast.error('Erreur lors de la suppression');
    },
  });
};

export const useSearchProducts = (searchQuery: string) => {
  return useQuery({
    queryKey: ['products', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }

      const query = searchQuery.trim();
      
      // Recherche dans le nom et la description
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('in_stock', true)
        .limit(10)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Product & { category: Category | null })[];
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
  });
};
