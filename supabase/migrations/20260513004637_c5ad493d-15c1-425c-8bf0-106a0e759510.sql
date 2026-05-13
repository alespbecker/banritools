
-- ============================================
-- Catálogo estruturado de produtos (aditivo)
-- ============================================

-- 1) Estender products (sem duplicar metric_type/points_per_unit/active/display_order)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS field_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS legacy_field text;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON public.products(slug) WHERE slug IS NOT NULL;

-- 2) Nova tabela product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  variant_type text NOT NULL DEFAULT 'subtype',
  legacy_field text,
  display_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, variant_type, slug)
);

CREATE INDEX IF NOT EXISTS product_variants_product_idx ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view product_variants"
  ON public.product_variants FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage product_variants insert"
  ON public.product_variants FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage product_variants update"
  ON public.product_variants FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage product_variants delete"
  ON public.product_variants FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Validação por trigger (sem CHECK)
CREATE OR REPLACE FUNCTION public.validate_product_variant_type()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.variant_type NOT IN (
    'subtype','operation_type','client_type','modality','brand',
    'stage','agreement','action','status','frequency','investment_type','machine_type'
  ) THEN
    RAISE EXCEPTION 'variant_type inválido: %', NEW.variant_type;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_validate_product_variant_type ON public.product_variants;
CREATE TRIGGER trg_validate_product_variant_type
  BEFORE INSERT OR UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.validate_product_variant_type();

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Estender production_entries (aditivo, opcional)
ALTER TABLE public.production_entries
  ADD COLUMN IF NOT EXISTS variant_id uuid,
  ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS production_entries_user_date_idx
  ON public.production_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS production_entries_agency_date_idx
  ON public.production_entries(agency_id, entry_date DESC);
