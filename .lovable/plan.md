## Ajuste de roles

1. Garantir que `alespbecker@gmail.com` tenha role `admin` em `user_roles` (substituir qualquer role existente).
2. Para todos os demais usuários em `profiles`, definir role `funcionario` em `user_roles` (substituir o que houver).

### SQL (executado via insert tool)

```sql
-- 1. Admin para alespbecker
DELETE FROM public.user_roles
 WHERE user_id = (SELECT id FROM auth.users WHERE email = 'alespbecker@gmail.com');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'alespbecker@gmail.com';

-- 2. Demais usuários como funcionario
DELETE FROM public.user_roles
 WHERE user_id <> (SELECT id FROM auth.users WHERE email = 'alespbecker@gmail.com');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'funcionario'::app_role
  FROM auth.users
 WHERE email <> 'alespbecker@gmail.com';
```

Após executar, faça logout/login para o app recarregar a role.
