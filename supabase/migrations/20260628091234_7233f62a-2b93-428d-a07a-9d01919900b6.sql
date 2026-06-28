
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS points_per_quantity numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_per_amount   numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_bucket       integer NOT NULL DEFAULT 1000;

-- Seed da calibração proposta (por slug)
UPDATE public.products SET points_per_quantity = 50, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'seguro-vida';
UPDATE public.products SET points_per_quantity = 30, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'seguro-ap-smart';
UPDATE public.products SET points_per_quantity = 20, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'capitalizacao';
UPDATE public.products SET points_per_quantity = 15, points_per_amount = 1,  amount_bucket = 1000  WHERE slug = 'previdencia';
UPDATE public.products SET points_per_quantity = 60, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'conta-pj';
UPDATE public.products SET points_per_quantity = 50, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'maquina-vero';
UPDATE public.products SET points_per_quantity = 40, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'portabilidade-salario';
UPDATE public.products SET points_per_quantity = 30, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'cartao-credito';
UPDATE public.products SET points_per_quantity = 5,  points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'banricompras';
UPDATE public.products SET points_per_quantity = 10, points_per_amount = 2,  amount_bucket = 1000  WHERE slug = 'credito-minuto-bens';
UPDATE public.products SET points_per_quantity = 10, points_per_amount = 2,  amount_bucket = 1000  WHERE slug = 'credito-minuto-emprestimo';
UPDATE public.products SET points_per_quantity = 5,  points_per_amount = 1,  amount_bucket = 1000  WHERE slug = 'cheque-especial';
UPDATE public.products SET points_per_quantity = 15, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'pacotes-servicos';
UPDATE public.products SET points_per_quantity = 5,  points_per_amount = 2,  amount_bucket = 10000 WHERE slug = 'investimentos';
UPDATE public.products SET points_per_quantity = 5,  points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'cdb-auto';
UPDATE public.products SET points_per_quantity = 0,  points_per_amount = 3,  amount_bucket = 1000  WHERE slug = 'consignado';
UPDATE public.products SET points_per_quantity = 0,  points_per_amount = 2,  amount_bucket = 1000  WHERE slug = 'credito-fidelidade';
UPDATE public.products SET points_per_quantity = 0,  points_per_amount = 4,  amount_bucket = 1000  WHERE slug = 'recuperacao';
UPDATE public.products SET points_per_quantity = 0,  points_per_amount = 4,  amount_bucket = 1000  WHERE slug = 'recuperacao-estagio-2-legacy';
UPDATE public.products SET points_per_quantity = 0,  points_per_amount = 4,  amount_bucket = 1000  WHERE slug = 'recuperacao-estagio-3-legacy';
UPDATE public.products SET points_per_quantity = 5,  points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'nps';
UPDATE public.products SET points_per_quantity = 20, points_per_amount = 0,  amount_bucket = 1000  WHERE slug = 'banricompras';
