
-- 1) Add cargo fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cargo text,
  ADD COLUMN IF NOT EXISTS cargo_especialidade text;

-- 2) Validation trigger for cargo values (CHECK substitute, per project convention)
CREATE OR REPLACE FUNCTION public.validate_profile_cargo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.cargo IS NOT NULL AND NEW.cargo NOT IN (
    'gerente_geral','gerente_adjunta','gerente_mercado','supervisor','tecn_pf','tecn_juridica'
  ) THEN
    RAISE EXCEPTION 'cargo inválido: %', NEW.cargo;
  END IF;

  IF NEW.cargo = 'gerente_mercado' THEN
    IF NEW.cargo_especialidade IS NULL OR NEW.cargo_especialidade NOT IN ('PJ','PF') THEN
      RAISE EXCEPTION 'cargo_especialidade deve ser PJ ou PF para Gerente de Mercado';
    END IF;
  ELSE
    -- Especialidade só faz sentido para gerente_mercado; zera caso contrário
    NEW.cargo_especialidade := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_profile_cargo ON public.profiles;
CREATE TRIGGER trg_validate_profile_cargo
  BEFORE INSERT OR UPDATE OF cargo, cargo_especialidade ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_cargo();

-- 3) Update handle_new_user to persist cargo from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_agency uuid;
  m_cargo text;
  m_esp text;
BEGIN
  SELECT id INTO default_agency FROM public.agencies ORDER BY created_at ASC LIMIT 1;

  m_cargo := NULLIF(NEW.raw_user_meta_data->>'cargo', '');
  m_esp   := NULLIF(NEW.raw_user_meta_data->>'cargo_especialidade', '');

  -- Sanitize: ignore invalid cargo values silently (trigger would block insert otherwise)
  IF m_cargo IS NOT NULL AND m_cargo NOT IN (
    'gerente_geral','gerente_adjunta','gerente_mercado','supervisor','tecn_pf','tecn_juridica'
  ) THEN
    m_cargo := NULL;
    m_esp := NULL;
  END IF;

  IF m_cargo = 'gerente_mercado' AND (m_esp NOT IN ('PJ','PF') OR m_esp IS NULL) THEN
    -- Sem especialidade válida, descarta o cargo para não bloquear o cadastro
    m_cargo := NULL;
    m_esp := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, name, agency_id, cargo, cargo_especialidade)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    default_agency,
    m_cargo,
    m_esp
  );

  -- Acesso padrão: funcionario (novo modelo) ao invés do legado 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'funcionario');

  RETURN NEW;
END;
$$;
