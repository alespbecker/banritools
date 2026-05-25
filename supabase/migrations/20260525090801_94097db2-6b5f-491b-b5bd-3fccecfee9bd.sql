ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS commission_per_unit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.products.commission_per_unit IS 'Comissão fixa em R$ por unidade vendida (produtos quantity/mixed).';
COMMENT ON COLUMN public.products.commission_rate IS 'Comissão percentual (0..1) sobre o valor (produtos amount/mixed). Ex: 0.015 = 1,5%.';