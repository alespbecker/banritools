CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date
  ON public.daily_reports (user_id, report_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_reports_agency_date
  ON public.daily_reports (agency_id, report_date DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_agency
  ON public.profiles (agency_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user
  ON public.user_roles (user_id);