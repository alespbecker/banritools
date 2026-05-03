-- Permitir gerentes gerenciarem metas da agência (alinhamento com campanhas)
DROP POLICY IF EXISTS "Admins insert agency goals" ON public.goals;
DROP POLICY IF EXISTS "Admins update agency goals" ON public.goals;
DROP POLICY IF EXISTS "Admins delete agency goals" ON public.goals;
DROP POLICY IF EXISTS "View own or agency goals" ON public.goals;

CREATE POLICY "Insert agency goals" ON public.goals
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
    AND ((agency_id IS NULL) OR (agency_id = public.get_user_agency_id(auth.uid())))
  );

CREATE POLICY "Update agency goals" ON public.goals
  FOR UPDATE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
    AND ((agency_id IS NULL) OR (agency_id = public.get_user_agency_id(auth.uid())))
  );

CREATE POLICY "Delete agency goals" ON public.goals
  FOR DELETE TO authenticated
  USING (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
    AND ((agency_id IS NULL) OR (agency_id = public.get_user_agency_id(auth.uid())))
  );

CREATE POLICY "View own or agency goals" ON public.goals
  FOR SELECT TO authenticated
  USING (
    (user_id = auth.uid())
    OR ((public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
        AND (agency_id = public.get_user_agency_id(auth.uid())))
  );