import { useState } from 'react';
import { toast } from 'sonner';

// Utilisation de l'API TheNewBlack pour générer des variantes de couleur
// Note: Cette API peut nécessiter un endpoint spécifique pour la re-colorisation
const API_KEY = 'EUVHZQEQXYIXKUB6R19J766FVMBIWG';

export const useAIColorVariants = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Génère une variante de couleur d'une image en utilisant une API de traitement d'image
   * Pour l'instant, on utilise une approche qui applique un filtre de couleur via Canvas
   * ou on peut utiliser une API externe si disponible
   */
  const generateColorVariant = async (
    imageUrl: string,
    color: string
  ): Promise<string | null> => {
    if (!imageUrl) {
      toast.error('Veuillez fournir une URL d\'image');
      return null;
    }

    setIsGenerating(true);

    try {
      // Mapping des noms de couleurs vers des codes hexadécimaux
      const colorMap: Record<string, string> = {
        'Rouge': '#FF0000',
        'Bleu': '#0000FF',
        'Noir': '#000000',
        'Blanc': '#FFFFFF',
        'Vert': '#00FF00',
        'Jaune': '#FFFF00',
        'Rose': '#FF69B4',
        'Violet': '#800080',
        'Orange': '#FFA500',
        'Gris': '#808080',
        'Beige': '#F5F5DC',
        'Marron': '#8B4513',
        'Bordeaux': '#800020',
        'Turquoise': '#40E0D0',
        'Corail': '#FF7F50',
      };

      const targetColor = colorMap[color] || '#000000';

      toast.info(`Génération de la variante ${color} en cours...`);

      // Option 1: Utiliser une API de re-colorisation (Replicate, Stability AI, etc.)
      // Pour l'instant, on va utiliser une approche Canvas pour appliquer un filtre de couleur
      
      // Créer un canvas pour traiter l'image
      const img = new Image();
      
      // Essayer avec CORS, sinon sans
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              toast.error('Impossible de traiter l\'image');
              resolve(null);
              setIsGenerating(false);
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            // Appliquer un filtre de couleur (approche simple)
            // Note: Cette approche est basique, pour une vraie re-colorisation, utilisez une API IA
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Convertir la couleur cible en RGB
            const hex = targetColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            // Appliquer un filtre de teinte (approche simplifiée)
            // Ajustez le blendFactor pour plus ou moins de couleur (0.2 = subtil, 0.5 = fort)
            const blendFactor = 0.35;
            
            for (let i = 0; i < data.length; i += 4) {
              // Mélanger la couleur originale avec la couleur cible
              // On préserve la luminosité pour un effet plus naturel
              const originalBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const targetBrightness = (r + g + b) / 3;
              const brightnessRatio = originalBrightness / (targetBrightness || 1);
              
              data[i] = Math.min(255, Math.max(0, data[i] * (1 - blendFactor) + r * blendFactor * brightnessRatio));     // R
              data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * (1 - blendFactor) + g * blendFactor * brightnessRatio)); // G
              data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * (1 - blendFactor) + b * blendFactor * brightnessRatio)); // B
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Convertir en base64
            const base64 = canvas.toDataURL('image/png');
            
            toast.success(`Variante ${color} générée!`);
            resolve(base64);
            setIsGenerating(false);
          } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Erreur lors du traitement de l\'image');
            resolve(null);
            setIsGenerating(false);
          }
        };
        
        img.onerror = (error) => {
          console.error('Image load error:', error);
          // Si CORS échoue, essayer sans CORS (pour les images locales/base64)
          if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
            img.crossOrigin = undefined;
            img.src = imageUrl;
            return;
          }
          toast.error('Erreur lors du chargement de l\'image. Vérifiez que l\'image est accessible.');
          resolve(null);
          setIsGenerating(false);
        };
        
        img.src = imageUrl;
      });
      
    } catch (error: any) {
      console.error('Error generating color variant:', error);
      toast.error(error?.message || 'Erreur lors de la génération de la variante de couleur');
      setIsGenerating(false);
      return null;
    }
  };

  /**
   * Génère plusieurs variantes de couleur pour une image
   */
  const generateMultipleColorVariants = async (
    imageUrl: string,
    colors: string[]
  ): Promise<Record<string, string>> => {
    const variants: Record<string, string> = {};

    for (const color of colors) {
      const variantUrl = await generateColorVariant(imageUrl, color);
      if (variantUrl) {
        variants[color] = variantUrl;
      }
      // Petit délai entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return variants;
  };

  return {
    generateColorVariant,
    generateMultipleColorVariants,
    isGenerating,
  };
};

