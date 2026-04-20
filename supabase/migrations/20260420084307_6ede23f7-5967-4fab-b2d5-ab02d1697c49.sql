
-- Enable realtime for gamification tables so all clients see updates immediately
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ranking_monthly;
ALTER PUBLICATION supabase_realtime ADD TABLE public.points_log;

-- Set REPLICA IDENTITY FULL so updates carry full row data over realtime
ALTER TABLE public.user_points REPLICA IDENTITY FULL;
ALTER TABLE public.user_badges REPLICA IDENTITY FULL;
ALTER TABLE public.ranking_monthly REPLICA IDENTITY FULL;
ALTER TABLE public.points_log REPLICA IDENTITY FULL;
ALTER TABLE public.daily_reports REPLICA IDENTITY FULL;

-- Allow admins (within same agency) to update / insert / delete user_roles via a SECURITY DEFINER RPC.
-- Direct table policies kept restrictive to avoid privilege escalation.
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user_id uuid, _new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_agency uuid;
  target_agency uuid;
  admin_count integer;
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar funções de usuário';
  END IF;

  -- Cannot change own role (avoid locking out the only admin by accident)
  IF _target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode alterar sua própria função';
  END IF;

  -- Caller and target must belong to same agency
  caller_agency := public.get_user_agency_id(auth.uid());
  target_agency := public.get_user_agency_id(_target_user_id);

  IF caller_agency IS NULL OR caller_agency <> target_agency THEN
    RAISE EXCEPTION 'Usuário alvo não pertence à sua agência';
  END IF;

  -- If demoting an admin, ensure at least one admin remains in the agency
  IF _new_role = 'user' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.role = 'admin' AND p.agency_id = caller_agency AND ur.user_id <> _target_user_id;

    IF admin_count = 0 THEN
      RAISE EXCEPTION 'Deve haver pelo menos um administrador na agência';
    END IF;
  END IF;

  -- Upsert role (one row per user)
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, _new_role);
END;
$$;

-- Allow admins to view roles of users in their agency (so toggle reflects current state)
DROP POLICY IF EXISTS "Admins can view agency roles" ON public.user_roles;
CREATE POLICY "Admins can view agency roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND user_id IN (
    SELECT id FROM public.profiles WHERE agency_id = public.get_user_agency_id(auth.uid())
  )
);
