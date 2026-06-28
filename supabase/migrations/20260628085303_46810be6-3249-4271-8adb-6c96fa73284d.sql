
-- 1) profiles: bloquear self-reassign de agency_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND agency_id IS NOT DISTINCT FROM public.get_user_agency_id(auth.uid())
  );

-- 2) audit_logs: pinar agency_id ao agency do autor
DROP POLICY IF EXISTS "Insert own audit logs" ON public.audit_logs;
CREATE POLICY "Insert own audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND agency_id IS NOT DISTINCT FROM public.get_user_agency_id(auth.uid())
  );

-- 3) production_entries: pinar agency_id ao agency do user_id
DROP POLICY IF EXISTS "Users insert own production" ON public.production_entries;
CREATE POLICY "Users insert own production" ON public.production_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      agency_id IS NULL  -- preenchido pelo trigger fill_production_entry_agency
      OR agency_id = public.get_user_agency_id(auth.uid())
    )
  );

-- 4) daily_reports: pinar agency_id (legado, mas RLS aberta)
DROP POLICY IF EXISTS "Users can insert own reports" ON public.daily_reports;
CREATE POLICY "Users can insert own reports" ON public.daily_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      agency_id IS NULL
      OR agency_id = public.get_user_agency_id(auth.uid())
    )
  );

-- 5) Revogar EXECUTE de funções SECURITY DEFINER que só devem rodar por triggers/serviço
REVOKE EXECUTE ON FUNCTION public.calculate_report_points(public.daily_reports) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_report_points() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_monthly_ranking(uuid, uuid, date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_badges(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.gen_invite_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fill_production_entry_agency() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_product_variant_type() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_campaign_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_campaign_contact_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_products_metric_type() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_production_entry_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_goals_fields() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_contact_interaction_type() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_profile_cargo() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;
-- has_role, get_user_agency_id, get_level, redeem_invite_code, admin_set_user_role permanecem callable
