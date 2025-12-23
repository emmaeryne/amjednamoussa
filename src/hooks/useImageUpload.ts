import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File, folder: string = 'products'): Promise<string | null> => {
    if (!file) {
      toast.error('Aucun fichier sélectionné');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 10MB)');
      return null;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL publique de l\'image');
      }

      toast.success('Image uploadée avec succès!');
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error?.message || 'Erreur lors de l\'upload de l\'image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
};

