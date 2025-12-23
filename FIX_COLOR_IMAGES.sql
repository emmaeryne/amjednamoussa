-- ============================================
-- Script SQL pour ajouter color_images à products
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase

-- ÉTAPE 1: Vérifier si la table products existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) THEN
    RAISE EXCEPTION 'ERREUR: La table public.products n''existe pas. Vous devez d''abord exécuter la migration de base (20251222124337_b2dd1534-33f8-45ec-b7ba-aa526ce5244e.sql)';
  END IF;
END $$;

-- ÉTAPE 2: Ajouter la colonne color_images si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'color_images'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN color_images JSONB DEFAULT '{}'::jsonb;
    
    RAISE NOTICE 'SUCCÈS: Colonne color_images ajoutée';
  ELSE
    RAISE NOTICE 'INFO: Colonne color_images existe déjà';
  END IF;
END $$;

-- ÉTAPE 3: Vérification finale
SELECT 
  'Vérification' as etape,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') 
    THEN 'Table products: OK'
    ELSE 'Table products: MANQUANTE'
  END as status
UNION ALL
SELECT 
  'Vérification' as etape,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'color_images') 
    THEN 'Colonne color_images: OK'
    ELSE 'Colonne color_images: MANQUANTE'
  END as status;

