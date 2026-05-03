
-- =========================================
-- PARTE A: Completar modelagem
-- =========================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS metric_type text NOT NULL DEFAULT 'quantity',
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.production_entries
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed';

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS period_type text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'individual';

CREATE INDEX IF NOT EXISTS idx_production_entries_user_date
  ON public.production_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_production_entries_agency_date
  ON public.production_entries(agency_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_production_entries_product
  ON public.production_entries(product_id);

-- Triggers de validação (em vez de CHECK)
CREATE OR REPLACE FUNCTION public.validate_products_metric_type()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.metric_type NOT IN ('quantity', 'amount', 'mixed') THEN
    RAISE EXCEPTION 'metric_type inválido: %', NEW.metric_type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_products_metric_type ON public.products;
CREATE TRIGGER trg_validate_products_metric_type
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.validate_products_metric_type();

CREATE OR REPLACE FUNCTION public.validate_production_entry_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('draft', 'confirmed', 'cancelled') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_production_entry_status ON public.production_entries;
CREATE TRIGGER trg_validate_production_entry_status
  BEFORE INSERT OR UPDATE ON public.production_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_production_entry_status();

CREATE OR REPLACE FUNCTION public.validate_goals_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.period_type NOT IN ('daily','weekly','monthly','quarterly','yearly') THEN
    RAISE EXCEPTION 'period_type inválido: %', NEW.period_type;
  END IF;
  IF NEW.scope NOT IN ('individual','agency') THEN
    RAISE EXCEPTION 'scope inválido: %', NEW.scope;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_goals_fields ON public.goals;
CREATE TRIGGER trg_validate_goals_fields
  BEFORE INSERT OR UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.validate_goals_fields();

-- updated_at trigger reusable
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_production_entries_updated_at ON public.production_entries;
CREATE TRIGGER trg_production_entries_updated_at BEFORE UPDATE ON public.production_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_goals_updated_at ON public.goals;
CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-fill agency_id em production_entries a partir do profile do usuário
CREATE OR REPLACE FUNCTION public.fill_production_entry_agency()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.agency_id IS NULL THEN
    NEW.agency_id := public.get_user_agency_id(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fill_production_entry_agency ON public.production_entries;
CREATE TRIGGER trg_fill_production_entry_agency
  BEFORE INSERT ON public.production_entries
  FOR EACH ROW EXECUTE FUNCTION public.fill_production_entry_agency();

-- =========================================
-- PARTE B: Tabelas para Etapa 2
-- =========================================

-- contact_interactions
CREATE TABLE IF NOT EXISTS public.contact_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'note',
  notes text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact ON public.contact_interactions(contact_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION public.validate_contact_interaction_type()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.type NOT IN ('call','message','meeting','note') THEN
    RAISE EXCEPTION 'type inválido: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_contact_interaction_type ON public.contact_interactions;
CREATE TRIGGER trg_validate_contact_interaction_type
  BEFORE INSERT OR UPDATE ON public.contact_interactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_contact_interaction_type();

ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own contact interactions" ON public.contact_interactions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR contact_id IN (SELECT id FROM public.contacts WHERE user_id = auth.uid())
    OR (public.has_role(auth.uid(),'admin')
        AND contact_id IN (
          SELECT c.id FROM public.contacts c
          JOIN public.profiles p ON p.id = c.user_id
          WHERE p.agency_id = public.get_user_agency_id(auth.uid())
        ))
  );

CREATE POLICY "Insert own contact interactions" ON public.contact_interactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update own contact interactions" ON public.contact_interactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Delete own contact interactions" ON public.contact_interactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  target_quantity numeric NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_campaign_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('draft','active','paused','completed','archived') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_campaign_status ON public.campaigns;
CREATE TRIGGER trg_validate_campaign_status
  BEFORE INSERT OR UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.validate_campaign_status();

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View agency campaigns" ON public.campaigns
  FOR SELECT TO authenticated
  USING (agency_id = public.get_user_agency_id(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins/gerentes manage campaigns insert" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'gerente'))
    AND (agency_id IS NULL OR agency_id = public.get_user_agency_id(auth.uid()))
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins/gerentes manage campaigns update" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'gerente'))
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

CREATE POLICY "Admins/gerentes manage campaigns delete" ON public.campaigns
  FOR DELETE TO authenticated
  USING (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'gerente'))
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

-- campaign_contacts
CREATE TABLE IF NOT EXISTS public.campaign_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign ON public.campaign_contacts(campaign_id);

CREATE OR REPLACE FUNCTION public.validate_campaign_contact_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pending','contacted','converted','lost') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_campaign_contact_status ON public.campaign_contacts;
CREATE TRIGGER trg_validate_campaign_contact_status
  BEFORE INSERT OR UPDATE ON public.campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION public.validate_campaign_contact_status();

DROP TRIGGER IF EXISTS trg_campaign_contacts_updated_at ON public.campaign_contacts;
CREATE TRIGGER trg_campaign_contacts_updated_at BEFORE UPDATE ON public.campaign_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View agency campaign_contacts" ON public.campaign_contacts
  FOR SELECT TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE agency_id = public.get_user_agency_id(auth.uid())
         OR public.has_role(auth.uid(),'admin')
    )
  );

CREATE POLICY "Manage campaign_contacts insert" ON public.campaign_contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE agency_id = public.get_user_agency_id(auth.uid())
    )
  );

CREATE POLICY "Manage campaign_contacts update" ON public.campaign_contacts
  FOR UPDATE TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE agency_id = public.get_user_agency_id(auth.uid())
    )
  );

CREATE POLICY "Manage campaign_contacts delete" ON public.campaign_contacts
  FOR DELETE TO authenticated
  USING (
    (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'gerente'))
    AND campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE agency_id = public.get_user_agency_id(auth.uid())
    )
  );
