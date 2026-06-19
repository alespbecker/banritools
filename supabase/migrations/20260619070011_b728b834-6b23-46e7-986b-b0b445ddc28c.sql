
-- 1) Tabela user_invites
CREATE OR REPLACE FUNCTION public.gen_invite_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
  attempts int := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.user_invites WHERE code = result);
    attempts := attempts + 1;
    IF attempts > 50 THEN
      RAISE EXCEPTION 'Falha ao gerar código único de convite';
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

CREATE TABLE public.user_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'funcionario',
  name text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Default usa a função criada acima
ALTER TABLE public.user_invites ALTER COLUMN code SET DEFAULT public.gen_invite_code();

CREATE INDEX user_invites_agency_idx ON public.user_invites(agency_id);
CREATE INDEX user_invites_code_idx ON public.user_invites(code);

-- 2) GRANTS (sem anon — resgate é via SECURITY DEFINER RPC)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_invites TO authenticated;
GRANT ALL ON public.user_invites TO service_role;

-- 3) Enable RLS
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- 4) Policies — apenas admin/gerente da mesma agência
CREATE POLICY "Admin/gerente can view agency invites"
ON public.user_invites FOR SELECT
TO authenticated
USING (
  agency_id = public.get_user_agency_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
);

CREATE POLICY "Admin/gerente can create invites for own agency"
ON public.user_invites FOR INSERT
TO authenticated
WITH CHECK (
  agency_id = public.get_user_agency_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
  AND created_by = auth.uid()
);

CREATE POLICY "Admin/gerente can update own agency invites"
ON public.user_invites FOR UPDATE
TO authenticated
USING (
  agency_id = public.get_user_agency_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
);

CREATE POLICY "Admin/gerente can delete own agency invites"
ON public.user_invites FOR DELETE
TO authenticated
USING (
  agency_id = public.get_user_agency_id(auth.uid())
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'))
);

-- 5) RPC para resgate (chamado pelo usuário recém-criado)
CREATE OR REPLACE FUNCTION public.redeem_invite_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv record;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO inv FROM public.user_invites WHERE code = upper(_code) FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código de convite inválido' USING ERRCODE = 'P0001';
  END IF;
  IF inv.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este convite já foi utilizado' USING ERRCODE = 'P0001';
  END IF;
  IF inv.expires_at < now() THEN
    RAISE EXCEPTION 'Este convite expirou' USING ERRCODE = 'P0001';
  END IF;

  -- Vincula o perfil à agência do convite
  UPDATE public.profiles
     SET agency_id = inv.agency_id,
         name = COALESCE(NULLIF(inv.name, ''), name)
   WHERE id = uid;

  -- Define o cargo do convite (substitui o default 'user')
  DELETE FROM public.user_roles WHERE user_id = uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, inv.role);

  -- Marca como usado
  UPDATE public.user_invites
     SET used_at = now(), used_by = uid
   WHERE id = inv.id;

  RETURN jsonb_build_object('ok', true, 'agency_id', inv.agency_id, 'role', inv.role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_invite_code(text) TO authenticated;

-- 6) Realtime no production_entries (para ranking ao vivo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'production_entries'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.production_entries';
  END IF;
END
$$;
ALTER TABLE public.production_entries REPLICA IDENTITY FULL;
