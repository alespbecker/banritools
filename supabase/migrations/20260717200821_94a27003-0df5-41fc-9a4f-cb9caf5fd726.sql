
-- Admin RPC: delete user (same agency), fully cascading through non-FK tables first
CREATE OR REPLACE FUNCTION public.admin_delete_user(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_agency uuid;
  target_agency uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir usuários';
  END IF;
  IF _target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode excluir sua própria conta';
  END IF;
  caller_agency := public.get_user_agency_id(auth.uid());
  target_agency := public.get_user_agency_id(_target_user_id);
  IF caller_agency IS NULL OR caller_agency <> target_agency THEN
    RAISE EXCEPTION 'Usuário alvo não pertence à sua agência';
  END IF;

  -- Tables without FK cascade
  DELETE FROM public.production_entries   WHERE user_id = _target_user_id;
  DELETE FROM public.goals                WHERE user_id = _target_user_id;
  DELETE FROM public.contact_interactions WHERE user_id = _target_user_id;
  DELETE FROM public.campaign_contacts    WHERE assigned_to = _target_user_id;
  UPDATE public.campaigns SET created_by = NULL WHERE created_by = _target_user_id;

  -- Delete from auth.users; cascades to profiles, user_roles, and dependents of profiles
  DELETE FROM auth.users WHERE id = _target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- Cleanup fictitious users
DO $$
DECLARE
  ids uuid[] := ARRAY[
    '35cb82e9-6558-4e4a-9236-da9c40e10b15', -- Ana Martins
    '019d46f0-9da1-4c77-84c8-1f0ebc2c2a68', -- Bruno Silva
    '87e5884e-0442-474c-900b-ef50dad5d72a', -- Carla Rocha
    'cf6f1f7e-b297-4637-82b8-0fa74d9a8031', -- Diego Souza
    'b148ef99-bbd6-4aa7-978f-bf247be84f1a', -- Elisa Pires
    '8a7ce9ae-16aa-4740-a388-e6fe8ffccefa', -- Fábio Lemos
    'e333dd38-7ae3-40c9-aa34-3915602aa32e', -- Gabriela Reis
    '881329d1-39af-4ef3-b634-0799eb1d4481', -- Henrique Alves
    '02d8ba8a-4239-437f-924c-a1c926ba6276', -- Isabela Costa
    '14e14c70-4235-4a45-82fb-216f91fc38b2', -- João Pedro
    'b2b6c0b2-7f33-4cc4-aa7c-c937394c3098'  -- John Tromundo
  ]::uuid[];
BEGIN
  DELETE FROM public.production_entries   WHERE user_id = ANY(ids);
  DELETE FROM public.goals                WHERE user_id = ANY(ids);
  DELETE FROM public.contact_interactions WHERE user_id = ANY(ids);
  DELETE FROM public.campaign_contacts    WHERE assigned_to = ANY(ids);
  UPDATE public.campaigns SET created_by = NULL WHERE created_by = ANY(ids);
  DELETE FROM auth.users WHERE id = ANY(ids);
END $$;
