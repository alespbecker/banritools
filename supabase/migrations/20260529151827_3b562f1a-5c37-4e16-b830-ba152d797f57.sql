
-- Add new products: Cheque Especial, CDB Auto, NPS
INSERT INTO public.products (slug, name, category, unit, metric_type, points_per_unit, commission_per_unit, commission_rate, display_order, active, description)
VALUES
  ('cheque-especial', 'Cheque Especial', 'Crédito', 'unidade', 'mixed', 25, 5, 0, 35, true, 'Limite de cheque especial aumentado ou contratado.'),
  ('cdb-auto', 'CDB Auto', 'Investimentos', 'unidade', 'quantity', 15, 3, 0, 75, true, 'Adesão ao CDB Auto. Marque ativação sim/não.'),
  ('nps', 'NPS', 'Relacionamento', 'unidade', 'quantity', 5, 0, 0, 95, true, 'Pesquisa NPS respondida pelo cliente.')
ON CONFLICT (slug) DO NOTHING;

-- Variants for Cheque Especial (action: aumento vs contratacao)
INSERT INTO public.product_variants (product_id, slug, name, variant_type, display_order, active)
SELECT p.id, 'aumento', 'Aumento de limite', 'action', 10, true FROM public.products p WHERE p.slug = 'cheque-especial'
ON CONFLICT DO NOTHING;
INSERT INTO public.product_variants (product_id, slug, name, variant_type, display_order, active)
SELECT p.id, 'contratacao', 'Contratação nova', 'action', 20, true FROM public.products p WHERE p.slug = 'cheque-especial'
ON CONFLICT DO NOTHING;

-- Variants for CDB Auto (status: ativado vs nao-ativado)
INSERT INTO public.product_variants (product_id, slug, name, variant_type, display_order, active)
SELECT p.id, 'ativado', 'Ativado', 'status', 10, true FROM public.products p WHERE p.slug = 'cdb-auto'
ON CONFLICT DO NOTHING;
INSERT INTO public.product_variants (product_id, slug, name, variant_type, display_order, active)
SELECT p.id, 'nao-ativado', 'Não ativado', 'status', 20, true FROM public.products p WHERE p.slug = 'cdb-auto'
ON CONFLICT DO NOTHING;
