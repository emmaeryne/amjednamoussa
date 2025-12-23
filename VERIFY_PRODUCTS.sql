-- ============================================
-- Script SQL pour vérifier l'état de la base de données
-- ============================================

-- Étape 1: Vérifier si la table products existe et combien de produits elle contient
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN color_images IS NOT NULL AND color_images != '{}'::jsonb THEN 1 END) as products_with_color_images
FROM public.products;

-- Étape 2: Voir tous les produits (même sans color_images)
SELECT 
  id,
  name,
  colors,
  CASE 
    WHEN color_images IS NULL THEN 'NULL'
    WHEN color_images = '{}'::jsonb THEN 'EMPTY {}'
    ELSE 'HAS DATA'
  END as color_images_status,
  image_url
FROM public.products
ORDER BY created_at DESC
LIMIT 20;

-- Étape 3: Si vous avez des produits, voir leur structure complète
-- Décommentez cette ligne et remplacez 'nom-du-produit' par un nom réel
-- SELECT * FROM public.products WHERE name ILIKE '%nom-du-produit%';

