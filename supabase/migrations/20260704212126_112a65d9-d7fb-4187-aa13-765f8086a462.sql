-- =============================================================
-- calc_entry_points_v3 — espelho SQL de src/features/production/points.ts
-- Se este arquivo mudar, atualize o TS (e vice-versa).
-- =============================================================
CREATE OR REPLACE FUNCTION public.calc_entry_points_v3(
  _quantity numeric,
  _amount numeric,
  _ppq numeric,
  _ppa numeric,
  _bucket numeric,
  _ppu numeric
) RETURNS integer
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE
    WHEN COALESCE(_ppq,0) = 0 AND COALESCE(_ppa,0) = 0
      THEN ROUND((COALESCE(_quantity,0) + COALESCE(_amount,0)) * COALESCE(_ppu,0))::int
    ELSE ROUND(
      COALESCE(_quantity,0) * COALESCE(_ppq,0)
      + (COALESCE(_amount,0) / COALESCE(NULLIF(_bucket,0), 1000)) * COALESCE(_ppa,0)
    )::int
  END;
$$;

REVOKE EXECUTE ON FUNCTION public.calc_entry_points_v3(numeric,numeric,numeric,numeric,numeric,numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.calc_entry_points_v3(numeric,numeric,numeric,numeric,numeric,numeric) TO authenticated;

COMMENT ON FUNCTION public.calc_entry_points_v3(numeric,numeric,numeric,numeric,numeric,numeric)
IS 'Espelho SQL da função calcEntryPoints em src/features/production/points.ts. Mantenha as duas em sincronia.';

-- =============================================================
-- get_agency_ranking — ranking mensal agregado, escopado à agência do chamador
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_agency_ranking(
  p_month date DEFAULT date_trunc('month', now())::date
) RETURNS TABLE(
  user_id uuid,
  name text,
  avatar_url text,
  points integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH scope AS (
    SELECT public.get_user_agency_id(auth.uid()) AS agency_id,
           date_trunc('month', p_month)::date AS m_start,
           (date_trunc('month', p_month) + interval '1 month')::date AS m_end
  )
  SELECT
    pf.id AS user_id,
    pf.name,
    pf.avatar_url,
    COALESCE(SUM(public.calc_entry_points_v3(
      pe.quantity, pe.amount,
      pr.points_per_quantity, pr.points_per_amount, pr.amount_bucket, pr.points_per_unit
    )), 0)::int AS points
  FROM scope s
  JOIN public.production_entries pe
    ON pe.agency_id = s.agency_id
   AND pe.entry_date >= s.m_start
   AND pe.entry_date <  s.m_end
   AND COALESCE(pe.status, 'confirmed') <> 'cancelled'
  JOIN public.products pr ON pr.id = pe.product_id
  JOIN public.profiles pf ON pf.id = pe.user_id
  WHERE s.agency_id IS NOT NULL
  GROUP BY pf.id, pf.name, pf.avatar_url
  HAVING COALESCE(SUM(public.calc_entry_points_v3(
      pe.quantity, pe.amount,
      pr.points_per_quantity, pr.points_per_amount, pr.amount_bucket, pr.points_per_unit
    )), 0) > 0
  ORDER BY points DESC, pf.name ASC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_agency_ranking(date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_agency_ranking(date) TO authenticated;

COMMENT ON FUNCTION public.get_agency_ranking(date)
IS 'Ranking agregado por usuário na agência do chamador. Nunca expõe entradas linha a linha. p_month = qualquer data do mês desejado.';

-- =============================================================
-- Policies aditivas (apenas SELECT). Não alteram INSERT/UPDATE/DELETE.
-- =============================================================

-- production_entries: admin + gerente da mesma agência
CREATE POLICY "Admins leem produção da agência"
  ON public.production_entries
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

CREATE POLICY "Gerentes leem produção da agência"
  ON public.production_entries
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'gerente')
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

-- daily_reports: admin + gerente da mesma agência
CREATE POLICY "Admins leem relatórios da agência"
  ON public.daily_reports
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

CREATE POLICY "Gerentes leem relatórios da agência"
  ON public.daily_reports
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'gerente')
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

-- profiles: admin + gerente da mesma agência (linha inteira, como admin já faz em UPDATE)
CREATE POLICY "Admins leem perfis da agência"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND agency_id = public.get_user_agency_id(auth.uid())
  );

CREATE POLICY "Gerentes leem perfis da agência"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'gerente')
    AND agency_id = public.get_user_agency_id(auth.uid())
  );