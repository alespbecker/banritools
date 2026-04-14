
-- 1. Points Log
CREATE TABLE public.points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id),
  points integer NOT NULL DEFAULT 0,
  source text NOT NULL,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.points_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (public.has_role(auth.uid(), 'admin') AND agency_id = public.get_user_agency_id(auth.uid())));

-- 2. User Points
CREATE TABLE public.user_points (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_points" ON public.user_points
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (public.has_role(auth.uid(), 'admin') AND user_id IN (SELECT id FROM public.profiles WHERE agency_id = public.get_user_agency_id(auth.uid()))));

-- 3. Badges
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  condition_type text NOT NULL,
  condition_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT TO authenticated USING (true);

-- 4. User Badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 5. Monthly Ranking Cache
CREATE TABLE public.ranking_monthly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES public.agencies(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month date NOT NULL,
  points integer NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);
ALTER TABLE public.ranking_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agency ranking" ON public.ranking_monthly
  FOR SELECT TO authenticated
  USING (agency_id = public.get_user_agency_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_points_log_user ON public.points_log(user_id, created_at DESC);
CREATE INDEX idx_points_log_ref ON public.points_log(reference_id);
CREATE INDEX idx_ranking_monthly_agency ON public.ranking_monthly(agency_id, month, position);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

-- Function: Calculate points from a daily report
CREATE OR REPLACE FUNCTION public.calculate_report_points(r public.daily_reports)
RETURNS integer
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE pts integer := 0;
BEGIN
  pts := pts + COALESCE(r.seguro_vida, 0) * 50;
  pts := pts + COALESCE(r.seguro_ap_smart, 0) * 30;
  pts := pts + COALESCE(r.capitalizacao, 0) * 20;
  pts := pts + COALESCE(r.credito_minuto_aumento, 0) * 40;
  pts := pts + COALESCE(r.pj_conta_empresarial, 0) * 60;
  pts := pts + COALESCE(r.pj_maquina_vero, 0) * 50;
  pts := pts + FLOOR(COALESCE(r.consignado_volume, 0) / 1000);
  pts := pts + FLOOR(COALESCE(r.credito_fidelidade_volume, 0) / 1000);
  pts := pts + FLOOR(COALESCE(r.recuperacao_estagio_2, 0) / 500);
  pts := pts + FLOOR(COALESCE(r.recuperacao_estagio_3, 0) / 500);
  RETURN pts;
END;
$$;

-- Function: Determine level from total points
CREATE OR REPLACE FUNCTION public.get_level(pts integer)
RETURNS integer
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN pts >= 15000 THEN 5
    WHEN pts >= 7000 THEN 4
    WHEN pts >= 3000 THEN 3
    WHEN pts >= 1000 THEN 2
    ELSE 1
  END;
$$;

-- Function: Check and award badges
CREATE OR REPLACE FUNCTION public.check_badges(_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  b RECORD;
  total_seguro_vida integer;
  total_seguros integer;
  total_consignado numeric;
  total_recuperacao numeric;
  consecutive_days integer;
BEGIN
  -- Aggregate stats
  SELECT
    COALESCE(SUM(seguro_vida), 0),
    COALESCE(SUM(seguro_vida), 0) + COALESCE(SUM(seguro_ap_smart), 0) + COALESCE(SUM(capitalizacao), 0),
    COALESCE(SUM(consignado_volume), 0),
    COALESCE(SUM(recuperacao_estagio_2), 0) + COALESCE(SUM(recuperacao_estagio_3), 0)
  INTO total_seguro_vida, total_seguros, total_consignado, total_recuperacao
  FROM daily_reports WHERE user_id = _user_id;

  -- Consecutive days (simplified: count distinct dates in last N days)
  SELECT COUNT(DISTINCT report_date)
  INTO consecutive_days
  FROM daily_reports
  WHERE user_id = _user_id
    AND report_date >= CURRENT_DATE - 9
    AND report_date <= CURRENT_DATE;

  FOR b IN SELECT * FROM badges LOOP
    -- Skip if already unlocked
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_id = b.id) THEN
      CONTINUE;
    END IF;

    IF b.condition_type = 'seguro_vida_count' AND total_seguro_vida >= b.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, b.id);
    ELSIF b.condition_type = 'seguros_total' AND total_seguros >= b.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, b.id);
    ELSIF b.condition_type = 'consignado_volume' AND total_consignado >= b.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, b.id);
    ELSIF b.condition_type = 'recuperacao_total' AND total_recuperacao >= b.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, b.id);
    ELSIF b.condition_type = 'consecutive_days' AND consecutive_days >= b.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, b.id);
    END IF;
  END LOOP;
END;
$$;

-- Function: Update ranking for a user's month
CREATE OR REPLACE FUNCTION public.update_monthly_ranking(_user_id uuid, _agency_id uuid, _month date)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  month_start date := date_trunc('month', _month)::date;
  month_end date := (date_trunc('month', _month) + interval '1 month' - interval '1 day')::date;
  user_pts integer;
BEGIN
  -- Calculate user's monthly points
  SELECT COALESCE(SUM(public.calculate_report_points(dr.*)), 0)
  INTO user_pts
  FROM daily_reports dr
  WHERE dr.user_id = _user_id AND dr.report_date >= month_start AND dr.report_date <= month_end;

  -- Upsert ranking
  INSERT INTO ranking_monthly (agency_id, user_id, month, points, position, updated_at)
  VALUES (_agency_id, _user_id, month_start, user_pts, 0, now())
  ON CONFLICT (user_id, month) DO UPDATE SET points = user_pts, agency_id = _agency_id, updated_at = now();

  -- Recalculate positions for the agency/month
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC) as pos
    FROM ranking_monthly
    WHERE agency_id = _agency_id AND month = month_start
  )
  UPDATE ranking_monthly rm SET position = ranked.pos
  FROM ranked WHERE rm.id = ranked.id;
END;
$$;

-- Main trigger function: fires on daily_reports insert/update
CREATE OR REPLACE FUNCTION public.handle_report_points()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  pts integer;
  old_pts integer := 0;
  new_total integer;
  new_level integer;
BEGIN
  -- Calculate new points
  pts := public.calculate_report_points(NEW);

  -- If update, subtract old points first
  IF TG_OP = 'UPDATE' THEN
    old_pts := public.calculate_report_points(OLD);
    DELETE FROM points_log WHERE reference_id = NEW.id AND user_id = NEW.user_id;
  END IF;

  -- Log points
  IF pts > 0 THEN
    INSERT INTO points_log (user_id, agency_id, points, source, reference_id)
    VALUES (NEW.user_id, NEW.agency_id, pts, 'daily_report', NEW.id);
  END IF;

  -- Update user total
  INSERT INTO user_points (user_id, total_points, level, updated_at)
  VALUES (NEW.user_id, pts, public.get_level(pts), now())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = (SELECT COALESCE(SUM(points), 0) FROM points_log WHERE user_id = NEW.user_id),
    level = public.get_level((SELECT COALESCE(SUM(points), 0) FROM points_log WHERE user_id = NEW.user_id)),
    updated_at = now();

  -- Update ranking
  PERFORM public.update_monthly_ranking(NEW.user_id, NEW.agency_id, NEW.report_date);

  -- Check badges
  PERFORM public.check_badges(NEW.user_id);

  RETURN NEW;
END;
$$;

-- Create trigger on daily_reports
CREATE TRIGGER tr_report_points
  AFTER INSERT OR UPDATE ON public.daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_report_points();

-- Seed badges
INSERT INTO public.badges (name, description, icon, condition_type, condition_value) VALUES
  ('Primeiro Seguro', 'Vendeu seu primeiro Seguro Vida', '🛡️', 'seguro_vida_count', 1),
  ('Vendedor de Seguros', 'Vendeu 20 seguros no total', '⭐', 'seguros_total', 20),
  ('Especialista em Consignado', 'Atingiu R$500k em consignado', '💰', 'consignado_volume', 500000),
  ('Recuperador', 'Recuperou R$50k em inadimplência', '🔄', 'recuperacao_total', 50000),
  ('Sequência de Produção', 'Registrou produção 10 dias consecutivos', '🔥', 'consecutive_days', 10);

-- Allow system to insert into points_log, user_points, user_badges, ranking_monthly (via trigger/security definer)
-- No user-facing INSERT policies needed since triggers handle writes
