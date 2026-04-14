
CREATE OR REPLACE FUNCTION public.calculate_report_points(r public.daily_reports)
RETURNS integer
LANGUAGE plpgsql IMMUTABLE
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.get_level(pts integer)
RETURNS integer
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN pts >= 15000 THEN 5
    WHEN pts >= 7000 THEN 4
    WHEN pts >= 3000 THEN 3
    WHEN pts >= 1000 THEN 2
    ELSE 1
  END;
$$;
