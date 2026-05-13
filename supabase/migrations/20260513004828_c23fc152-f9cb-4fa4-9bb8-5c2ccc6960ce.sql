
DROP INDEX IF EXISTS public.products_slug_unique;
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
