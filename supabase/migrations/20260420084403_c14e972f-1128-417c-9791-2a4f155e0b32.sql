
CREATE OR REPLACE FUNCTION public.handle_report_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pts integer;
  user_total integer;
BEGIN
  -- Calculate new points for this report
  pts := public.calculate_report_points(NEW);

  -- If update, remove previous log entry for this report
  IF TG_OP = 'UPDATE' THEN
    DELETE FROM points_log WHERE reference_id = NEW.id AND user_id = NEW.user_id;
  END IF;

  -- Log points
  IF pts > 0 THEN
    INSERT INTO points_log (user_id, agency_id, points, source, reference_id)
    VALUES (NEW.user_id, NEW.agency_id, pts, 'daily_report', NEW.id);
  END IF;

  -- Recalculate user's running total
  SELECT COALESCE(SUM(points), 0)::integer INTO user_total
  FROM points_log WHERE user_id = NEW.user_id;

  INSERT INTO user_points (user_id, total_points, level, updated_at)
  VALUES (NEW.user_id, user_total, public.get_level(user_total), now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = EXCLUDED.total_points,
        level = EXCLUDED.level,
        updated_at = now();

  -- Update monthly ranking only when we have an agency
  IF NEW.agency_id IS NOT NULL THEN
    PERFORM public.update_monthly_ranking(NEW.user_id, NEW.agency_id, NEW.report_date);
  END IF;

  -- Check badges
  PERFORM public.check_badges(NEW.user_id);

  RETURN NEW;
END;
$function$;
