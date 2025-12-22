-- Créer le bucket pour les images de produits
-- Note: Cette migration doit être exécutée manuellement dans Supabase Dashboard
-- car la création de buckets nécessite des permissions spéciales

-- Instructions:
-- 1. Allez dans Supabase Dashboard > Storage
-- 2. Créez un nouveau bucket nommé "product-images"
-- 3. Configurez les politiques RLS suivantes:

-- Policy pour permettre l'upload d'images (authenticated users only)
-- CREATE POLICY "Allow authenticated users to upload images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'product-images');

-- Policy pour permettre la lecture publique des images
-- CREATE POLICY "Allow public read access to product images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'product-images');

-- Policy pour permettre la suppression d'images (authenticated users only)
-- CREATE POLICY "Allow authenticated users to delete images"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'product-images');

-- Note: Si vous voulez permettre l'upload anonyme, utilisez 'anon' au lieu de 'authenticated'

