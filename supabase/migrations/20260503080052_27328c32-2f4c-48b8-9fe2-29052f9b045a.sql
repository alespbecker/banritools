-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  agency_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert own audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid());

CREATE POLICY "Admins/gerentes view agency audit"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gerente'::app_role))
    AND (agency_id IS NULL OR agency_id = public.get_user_agency_id(auth.uid()))
  );

CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_created ON public.audit_logs(agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_production_entries_date ON public.production_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_production_entries_user_date ON public.production_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_followup ON public.contact_interactions(next_follow_up) WHERE next_follow_up IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_status ON public.campaign_contacts(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_user_followup ON public.contacts(user_id, next_follow_up);