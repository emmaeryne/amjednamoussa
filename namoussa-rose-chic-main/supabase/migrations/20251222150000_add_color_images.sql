-- Ajouter le champ color_images pour stocker les images par couleur
-- Cette migration ajoute une colonne JSONB pour stocker un objet mappant les couleurs aux URLs d'images
-- Format: { "Rouge": "https://...", "Bleu": "https://...", "Noir": "https://..." }

-- Vérifier si la colonne existe déjà avant de l'ajouter
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
    
    -- Ajouter un commentaire pour documenter la colonne
    COMMENT ON COLUMN public.products.color_images IS 'Stocke les images par couleur sous forme d''objet JSON. Format: {"Couleur": "URL"}';
  END IF;
END $$;
