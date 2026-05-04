
-- 1. campaigns: scope admin SELECT to own agency
DROP POLICY IF EXISTS "View agency campaigns" ON public.campaigns;
CREATE POLICY "View agency campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (agency_id = public.get_user_agency_id(auth.uid()));

-- 2. ranking_monthly: scope admin SELECT to own agency
DROP POLICY IF EXISTS "Users can view agency ranking" ON public.ranking_monthly;
CREATE POLICY "Users can view agency ranking"
ON public.ranking_monthly
FOR SELECT
TO authenticated
USING (agency_id = public.get_user_agency_id(auth.uid()));

-- 3. audit_logs: restrict null agency_id rows to admins only
DROP POLICY IF EXISTS "Admins/gerentes view agency audit" ON public.audit_logs;
CREATE POLICY "Admins/gerentes view agency audit"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
    AND agency_id IS NOT NULL
    AND agency_id = public.get_user_agency_id(auth.uid())
  )
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND agency_id IS NULL
  )
);

-- 4. campaign_contacts: require admin/gerente role for insert/update
DROP POLICY IF EXISTS "Manage campaign_contacts insert" ON public.campaign_contacts;
CREATE POLICY "Manage campaign_contacts insert"
ON public.campaign_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE agency_id = public.get_user_agency_id(auth.uid())
  )
);

DROP POLICY IF EXISTS "Manage campaign_contacts update" ON public.campaign_contacts;
CREATE POLICY "Manage campaign_contacts update"
ON public.campaign_contacts
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE agency_id = public.get_user_agency_id(auth.uid())
  )
);

-- 5. goals: require non-null agency_id and scope strictly
DROP POLICY IF EXISTS "Insert agency goals" ON public.goals;
CREATE POLICY "Insert agency goals"
ON public.goals
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND agency_id IS NOT NULL
  AND agency_id = public.get_user_agency_id(auth.uid())
);

DROP POLICY IF EXISTS "Update agency goals" ON public.goals;
CREATE POLICY "Update agency goals"
ON public.goals
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND agency_id IS NOT NULL
  AND agency_id = public.get_user_agency_id(auth.uid())
);

DROP POLICY IF EXISTS "Delete agency goals" ON public.goals;
CREATE POLICY "Delete agency goals"
ON public.goals
FOR DELETE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
  AND agency_id IS NOT NULL
  AND agency_id = public.get_user_agency_id(auth.uid())
);

DROP POLICY IF EXISTS "View own or agency goals" ON public.goals;
CREATE POLICY "View own or agency goals"
ON public.goals
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
    AND agency_id IS NOT NULL
    AND agency_id = public.get_user_agency_id(auth.uid())
  )
);

-- 6. Revoke EXECUTE on admin/trigger SECURITY DEFINER functions from public roles
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_report_points() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_badges(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_monthly_ranking(uuid, uuid, date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fill_production_entry_agency() FROM anon, authenticated;
