-- ============================================
-- Script SQL à exécuter dans Supabase SQL Editor
-- ============================================
-- Ce script ajoute la colonne color_images à la table products
-- et rafraîchit le cache du schéma

-- Étape 1: Ajouter la colonne si elle n'existe pas
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'::jsonb;

-- Étape 2: Vérifier que la colonne a été créée
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products' 
AND column_name = 'color_images';

-- Étape 3: Attendre quelques secondes pour que le cache se rafraîchisse
-- Le cache PostgREST de Supabase se rafraîchit automatiquement,
-- mais cela peut prendre 1-2 minutes après l'ajout de la colonne.

-- Si l'erreur persiste après avoir exécuté ce script:
-- 1. Attendez 2-3 minutes
-- 2. Redémarrez votre application
-- 3. Vérifiez dans Supabase Dashboard > Table Editor > products que la colonne existe
