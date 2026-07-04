CREATE TABLE public.invite_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  agency_name text NOT NULL,
  cargo text,
  cargo_especialidade text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  invite_id uuid REFERENCES public.user_invites(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.invite_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.invite_requests TO authenticated;
GRANT ALL ON public.invite_requests TO service_role;

ALTER TABLE public.invite_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode solicitar convite"
  ON public.invite_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins leem solicitacoes"
  ON public.invite_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam solicitacoes"
  ON public.invite_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_invite_request_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','approved','rejected') THEN
    RAISE EXCEPTION 'status inválido: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invite_requests_validate_status
  BEFORE INSERT OR UPDATE ON public.invite_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_invite_request_status();

CREATE TRIGGER trg_invite_requests_updated_at
  BEFORE UPDATE ON public.invite_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX invite_requests_status_created_idx
  ON public.invite_requests (status, created_at DESC);