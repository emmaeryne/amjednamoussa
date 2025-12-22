import { useState } from 'react';
import { toast } from 'sonner';

const API_KEY = 'EUVHZQEQXYIXKUB6R19J766FVMBIWG';
const API_URL = `https://thenewblack.ai/api/1.1/wf/ai-fashion-models-items?api_key=${API_KEY}`;

interface FashionItem {
  url: string;
  type?: 'top' | 'bottom' | 'shoes' | 'accessory';
}

export const useAIFashionModel = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateModelImage = async (items: FashionItem[]): Promise<string | null> => {
    if (!items || items.length === 0) {
      toast.error('Veuillez ajouter au moins un article');
      return null;
    }

    setIsGenerating(true);

    try {
      // Convertir les URLs en base64 si nécessaire, ou utiliser directement les URLs
      const itemUrls = items.map(item => item.url);

      // Format de requête pour l'API TheNewBlack
      // L'API attend un tableau d'URLs d'images d'articles
      const requestBody = {
        items: itemUrls,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // L'API retourne généralement l'URL de l'image générée
      if (data.image_url || data.url || data.result?.image_url) {
        const imageUrl = data.image_url || data.url || data.result?.image_url;
        toast.success('Image de modèle générée avec succès!');
        return imageUrl;
      } else {
        // Si l'API retourne directement l'image en base64
        if (data.image || data.base64) {
          const base64Image = data.image || data.base64;
          const imageUrl = `data:image/png;base64,${base64Image}`;
          toast.success('Image de modèle générée avec succès!');
          return imageUrl;
        }
        
        throw new Error('Format de réponse inattendu de l\'API');
      }
    } catch (error: any) {
      console.error('Error generating model image:', error);
      toast.error(error?.message || 'Erreur lors de la génération de l\'image du modèle');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateModelImage,
    isGenerating,
  };
};

