
-- 1. Profiles: scope admin reads by agency
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR (has_role(auth.uid(), 'admin'::app_role) AND agency_id = public.get_user_agency_id(auth.uid()))
);

-- 2. user_badges: scope admin reads by agency
DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges"
ON public.user_badges
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND user_id IN (
      SELECT p.id FROM public.profiles p
      WHERE p.agency_id = public.get_user_agency_id(auth.uid())
    )
  )
);

-- 3. Realtime: enable RLS and restrict subscriptions to user-scoped topics.
-- Convention: client subscribes to a topic equal to their auth.uid() (e.g. `gamification-<uid>`).
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can receive own-topic messages" ON realtime.messages;
CREATE POLICY "Authenticated can receive own-topic messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);

DROP POLICY IF EXISTS "Authenticated can send own-topic messages" ON realtime.messages;
CREATE POLICY "Authenticated can send own-topic messages"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE '%' || auth.uid()::text || '%'
);

-- 4. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated.
-- These are only called by triggers (run as table owner) or by other SECURITY DEFINER functions.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_report_points() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_badges(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_monthly_ranking(uuid, uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fill_production_entry_agency() FROM PUBLIC, anon, authenticated;

-- Keep callable by signed-in users (needed by RLS / RPC):
--   has_role, get_user_agency_id, get_level, calculate_report_points, admin_set_user_role
-- but block anonymous callers explicitly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_agency_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_level(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.calculate_report_points(public.daily_reports) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, app_role) FROM anon;
