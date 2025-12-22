-- ============================================
-- Script SQL pour vérifier les color_images des produits
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase

-- Option 1: Voir tous les produits avec leurs color_images
SELECT 
  id,
  name,
  colors,
  color_images,
  image_url
FROM public.products
ORDER BY created_at DESC
LIMIT 10;

-- Option 2: Voir seulement les produits qui ont des color_images
SELECT 
  id,
  name,
  colors,
  color_images,
  image_url
FROM public.products
WHERE color_images IS NOT NULL 
  AND color_images != '{}'::jsonb
ORDER BY created_at DESC;

-- Option 3: Voir un produit spécifique (remplacez l'ID par celui de votre produit)
-- Pour trouver l'ID, utilisez d'abord la requête Option 1
-- SELECT 
--   id,
--   name,
--   colors,
--   color_images,
--   image_url
-- FROM public.products
-- WHERE id = 'remplacez-par-l-id-du-produit';

-- Option 4: Vérifier la structure de color_images pour un produit
-- SELECT 
--   name,
--   colors,
--   jsonb_object_keys(color_images) as color_key,
--   color_images->jsonb_object_keys(color_images) as image_url
-- FROM public.products
-- WHERE color_images IS NOT NULL 
--   AND color_images != '{}'::jsonb
-- LIMIT 5;

