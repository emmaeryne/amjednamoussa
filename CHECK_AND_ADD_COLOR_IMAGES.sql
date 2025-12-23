-- ============================================
-- Script SQL complet pour vérifier et ajouter color_images
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase

-- Étape 1: Vérifier si la table products existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'products';

-- Si la requête ci-dessus ne retourne rien, la table n'existe pas.
-- Dans ce cas, vous devez d'abord exécuter les migrations de base.

-- Étape 2: Si la table existe, ajouter la colonne color_images
DO $$ 
BEGIN
  -- Vérifier d'abord si la table products existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) THEN
    RAISE EXCEPTION 'ERREUR: La table public.products n''existe pas. Veuillez d''abord exécuter les migrations de base (20251222124337_b2dd1534-33f8-45ec-b7ba-aa526ce5244e.sql)';
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
    
    RAISE NOTICE 'SUCCÈS: Colonne color_images ajoutée avec succès';
  ELSE
    RAISE NOTICE 'INFO: La colonne color_images existe déjà';
  END IF;
END $$;

-- Étape 3: Vérifier que tout est en ordre
SELECT 
  'Table products' as type,
  table_name as name,
  'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'products'

UNION ALL

SELECT 
  'Column color_images' as type,
  column_name as name,
  CASE 
    WHEN column_name IS NOT NULL THEN 'exists'
    ELSE 'missing'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name = 'color_images';

