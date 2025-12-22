-- Ajouter la catégorie "Tops" si elle n'existe pas
INSERT INTO public.categories (name, slug, created_at)
SELECT 'Tops', 'top', now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE slug = 'top'
);

