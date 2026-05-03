
-- 1. Extend app_role enum (mantém admin e user)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'funcionario';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gerente';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

-- 2. products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  unit text DEFAULT 'unidade',
  points_per_unit numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view products"
  ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage products insert"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products update"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products delete"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. production_entries
CREATE TABLE IF NOT EXISTS public.production_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agency_id uuid REFERENCES public.agencies(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  quantity numeric NOT NULL DEFAULT 0,
  amount numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_production_entries_user_date
  ON public.production_entries (user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_production_entries_agency_date
  ON public.production_entries (agency_id, entry_date DESC);
ALTER TABLE public.production_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own production"
  ON public.production_entries FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR (public.has_role(auth.uid(), 'admin')
        AND agency_id = public.get_user_agency_id(auth.uid())));
CREATE POLICY "Users insert own production"
  ON public.production_entries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own production"
  ON public.production_entries FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users delete own production"
  ON public.production_entries FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 4. goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  agency_id uuid REFERENCES public.agencies(id),
  product_id uuid REFERENCES public.products(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  target_quantity numeric NOT NULL DEFAULT 0,
  target_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals (user_id);
CREATE INDEX IF NOT EXISTS idx_goals_agency ON public.goals (agency_id);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or agency goals"
  ON public.goals FOR SELECT TO authenticated
  USING (user_id = auth.uid()
    OR (public.has_role(auth.uid(), 'admin')
        AND agency_id = public.get_user_agency_id(auth.uid())));
CREATE POLICY "Admins insert agency goals"
  ON public.goals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin')
    AND (agency_id IS NULL OR agency_id = public.get_user_agency_id(auth.uid())));
CREATE POLICY "Admins update agency goals"
  ON public.goals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
    AND (agency_id IS NULL OR agency_id = public.get_user_agency_id(auth.uid())));
CREATE POLICY "Admins delete agency goals"
  ON public.goals FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
    AND (agency_id IS NULL OR agency_id = public.get_user_agency_id(auth.uid())));
