import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Category } from '@/types';

interface ExcelProductRow {
  'Nom du produit': string;
  'Description': string;
  'Prix (DT)': number;
  'URL Image': string;
  'Catégorie': string;
  'Tailles (séparées par virgule)': string;
  'Couleurs (séparées par virgule)': string;
  'En stock (Oui/Non)': string;
}

export const useExcelImport = () => {
  const queryClient = useQueryClient();

  const generateTemplate = async (categories: Category[]) => {
    try {
      // Créer les données du template
      const templateData = [
        {
          'Nom du produit': 'Exemple: Robe élégante',
          'Description': 'Exemple: Robe élégante en satin',
          'Prix (DT)': 89.99,
          'URL Image': 'https://example.com/image.jpg',
          'Catégorie': categories.length > 0 ? categories[0].name : 'Robes',
          'Tailles (séparées par virgule)': 'S, M, L, XL',
          'Couleurs (séparées par virgule)': 'Rouge, Bleu, Noir',
          'En stock (Oui/Non)': 'Oui',
        },
        {
          'Nom du produit': '',
          'Description': '',
          'Prix (DT)': '',
          'URL Image': '',
          'Catégorie': '',
          'Tailles (séparées par virgule)': '',
          'Couleurs (séparées par virgule)': '',
          'En stock (Oui/Non)': '',
        },
      ];

      // Créer un workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);

      // Définir la largeur des colonnes
      ws['!cols'] = [
        { wch: 25 }, // Nom
        { wch: 40 }, // Description
        { wch: 12 }, // Prix
        { wch: 30 }, // URL Image
        { wch: 20 }, // Catégorie
        { wch: 30 }, // Tailles
        { wch: 30 }, // Couleurs
        { wch: 15 }, // En stock
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Produits');

      // Créer une feuille avec les catégories disponibles
      const categoriesSheet = XLSX.utils.json_to_sheet(
        categories.map(cat => ({ 'Catégories disponibles': cat.name }))
      );
      XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Catégories');

      // Télécharger le fichier
      XLSX.writeFile(wb, 'template-produits.xlsx');
      toast.success('Template Excel téléchargé');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Erreur lors de la génération du template');
    }
  };

  const importProducts = useMutation({
    mutationFn: async ({ file, categories }: { file: File; categories: Category[] }) => {
      return new Promise<{ success: number; errors: string[] }>((resolve) => {
        const reader = new FileReader();
        const errors: string[] = [];
        let successCount = 0;

        reader.onload = async (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows: ExcelProductRow[] = XLSX.utils.sheet_to_json(worksheet);

            // Créer un mapping des catégories par nom
            const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat.id]));

            // Traiter chaque ligne
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              
              // Ignorer les lignes vides ou d'exemple
              if (!row['Nom du produit'] || 
                  row['Nom du produit'].toString().toLowerCase().includes('exemple') ||
                  row['Nom du produit'].toString().trim() === '') {
                continue;
              }

              try {
                // Valider et préparer les données
                const name = row['Nom du produit']?.toString().trim();
                const description = row['Description']?.toString().trim() || null;
                const price = parseFloat(row['Prix (DT)']?.toString() || '0');
                const imageUrl = row['URL Image']?.toString().trim() || null;
                const categoryName = row['Catégorie']?.toString().trim() || '';
                const sizesStr = row['Tailles (séparées par virgule)']?.toString().trim() || '';
                const colorsStr = row['Couleurs (séparées par virgule)']?.toString().trim() || '';
                const inStockStr = row['En stock (Oui/Non)']?.toString().trim().toLowerCase() || 'oui';

                if (!name) {
                  errors.push(`Ligne ${i + 2}: Nom du produit requis`);
                  continue;
                }

                if (isNaN(price) || price <= 0) {
                  errors.push(`Ligne ${i + 2}: Prix invalide`);
                  continue;
                }

                // Trouver la catégorie
                let categoryId: string | null = null;
                if (categoryName) {
                  const foundCategory = categories.find(
                    cat => cat.name.toLowerCase() === categoryName.toLowerCase()
                  );
                  categoryId = foundCategory?.id || null;
                  if (!foundCategory) {
                    errors.push(`Ligne ${i + 2}: Catégorie "${categoryName}" non trouvée`);
                  }
                }

                // Parser les tailles et couleurs
                const sizes = sizesStr
                  ? sizesStr.split(',').map(s => s.trim()).filter(s => s)
                  : [];
                const colors = colorsStr
                  ? colorsStr.split(',').map(c => c.trim()).filter(c => c)
                  : [];

                const inStock = inStockStr === 'oui' || inStockStr === 'yes' || inStockStr === '1' || inStockStr === 'true';

                // Créer le produit
                const { error } = await supabase
                  .from('products')
                  .insert({
                    name,
                    description,
                    price,
                    image_url: imageUrl,
                    category_id: categoryId,
                    sizes,
                    colors,
                    in_stock: inStock,
                  });

                if (error) {
                  errors.push(`Ligne ${i + 2}: ${error.message}`);
                } else {
                  successCount++;
                }
              } catch (error: any) {
                errors.push(`Ligne ${i + 2}: ${error.message || 'Erreur inconnue'}`);
              }
            }

            resolve({ success: successCount, errors });
          } catch (error: any) {
            errors.push(`Erreur lors de la lecture du fichier: ${error.message}`);
            resolve({ success: successCount, errors });
          }
        };

        reader.readAsBinaryString(file);
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (result.errors.length > 0) {
        toast.warning(`${result.success} produit(s) importé(s), ${result.errors.length} erreur(s)`);
        console.error('Erreurs d\'import:', result.errors);
      } else {
        toast.success(`${result.success} produit(s) importé(s) avec succès`);
      }
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      toast.error('Erreur lors de l\'import des produits');
    },
  });

  return {
    generateTemplate,
    importProducts,
  };
};

