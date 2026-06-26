
CREATE POLICY "Admins can update agency profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) AND agency_id = public.get_user_agency_id(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND agency_id = public.get_user_agency_id(auth.uid()));

CREATE POLICY "Admins update agency production" ON public.production_entries
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) AND agency_id = public.get_user_agency_id(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND agency_id = public.get_user_agency_id(auth.uid()));

CREATE POLICY "Admins delete agency production" ON public.production_entries
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) AND agency_id = public.get_user_agency_id(auth.uid()));
