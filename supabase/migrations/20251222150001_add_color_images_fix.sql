-- Script SQL pour ajouter la colonne color_images à la table products
-- Exécutez ce script dans le SQL Editor de Supabase

-- Vérifier et ajouter la colonne color_images si elle n'existe pas
DO $$ 
BEGIN
  -- Vérifier d'abord si la table products existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) THEN
    RAISE EXCEPTION 'La table public.products n''existe pas. Veuillez d''abord exécuter les migrations de base.';
  END IF;
  
  -- Vérifier si la colonne existe déjà
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'color_images'
  ) THEN
    -- Ajouter la colonne
    ALTER TABLE public.products 
    ADD COLUMN color_images JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'Colonne color_images ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne color_images existe déjà';
  END IF;
END $$;

-- Vérifier que la table et la colonne existent
SELECT 
  t.table_name,
  c.column_name, 
  c.data_type, 
  c.column_default,
  c.is_nullable
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
  ON c.table_schema = t.table_schema 
  AND c.table_name = t.table_name
  AND c.column_name = 'color_images'
WHERE t.table_schema = 'public' 
AND t.table_name = 'products';

