ALTER TABLE public.contact_interactions
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS next_follow_up date;

CREATE INDEX IF NOT EXISTS idx_contact_interactions_next_follow_up
  ON public.contact_interactions(next_follow_up)
  WHERE next_follow_up IS NOT NULL;