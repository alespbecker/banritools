
ALTER TABLE public.daily_reports
  ADD COLUMN seguro_vida_valor numeric DEFAULT 0,
  ADD COLUMN seguro_ap_smart_valor numeric DEFAULT 0,
  ADD COLUMN capitalizacao_valor numeric DEFAULT 0;
