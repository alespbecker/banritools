
-- Seed default agency and assign existing profiles without one
INSERT INTO public.agencies (name, city, state)
SELECT 'Agência Principal', 'Porto Alegre', 'RS'
WHERE NOT EXISTS (SELECT 1 FROM public.agencies);

UPDATE public.profiles
SET agency_id = (SELECT id FROM public.agencies ORDER BY created_at ASC LIMIT 1)
WHERE agency_id IS NULL;

-- Ensure new signups inherit the default agency automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_agency uuid;
BEGIN
  SELECT id INTO default_agency FROM public.agencies ORDER BY created_at ASC LIMIT 1;

  INSERT INTO public.profiles (id, email, name, agency_id)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), default_agency);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;
