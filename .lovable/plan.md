# Correção crítica de leitura por agência (ranking + painel)

## Diagnóstico confirmado
- `production_entries` e `profiles` só liberam SELECT ao próprio dono e admin. Com 2+ usuários, `ranking-v3` e o bloco de ranking do `dashboard-v3` filtram silenciosamente colegas → "1º de 1" e nomes vazios.
- `useAuth` cai em `?? "user"` (role legada) em vez de `viewer` neutro.
- `calcEntryPoints` (TS) precisa de espelho SQL para a RPC agregada bater com o preview do registro.

## Plano de execução

### 1) Migration nova `add_agency_ranking_rpc.sql`
Somente adições, sem editar migrations antigas. Ordem:

**a. Função `public.calc_entry_points_v3(quantity, amount, ppq, ppa, bucket, ppu)`**
- `LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = public`.
- Espelha 1:1 `src/features/production/points.ts`: se `ppq=0 AND ppa=0` → `round((q+a)*ppu)`; senão `round(q*ppq + (a/coalesce(nullif(bucket,0),1000))*ppa)`.
- Comentário SQL apontando para `src/features/production/points.ts` (e vice-versa no TS).

**b. Função `public.get_agency_ranking(p_month date DEFAULT date_trunc('month', now())::date)`**
- `RETURNS TABLE(user_id uuid, name text, avatar_url text, points integer)`.
- `LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public`.
- Escopo: `agency_id = public.get_user_agency_id(auth.uid())`; janela `[date_trunc('month', p_month), + 1 month)`.
- Join `production_entries pe` + `products pr` + `profiles pf`; soma `calc_entry_points_v3(...)`; `GROUP BY user_id, name, avatar_url`; `HAVING sum > 0`; `ORDER BY points DESC, name ASC`.
- `REVOKE EXECUTE ... FROM anon; GRANT EXECUTE ... TO authenticated;`
- Retorna 0 linhas se `get_user_agency_id` for NULL (sem ag).

**c. Policies (apenas SELECT, aditivas — não mexem em INSERT/UPDATE/DELETE)**
- `production_entries`: nova policy "Gerentes leem entradas da sua agência" → `has_role(auth.uid(),'gerente') AND agency_id = get_user_agency_id(auth.uid())`.
- `daily_reports`: idem, nova policy espelhando a de admin com `gerente`.
- `profiles`: nova policy "Gerentes leem perfis da sua agência" → `has_role(auth.uid(),'gerente') AND agency_id = get_user_agency_id(auth.uid())` (linha inteira, como admin).
- Funcionário/viewer continuam sem SELECT amplo — leem colegas só pela RPC.

### 2) Front — 3 edits cirúrgicos

**`src/features/production/points.ts`**: adicionar comentário no topo de `calcEntryPoints` apontando para `public.calc_entry_points_v3` na migration correspondente. Nenhuma mudança de lógica. Não renomear/remover.

**`src/routes/_authenticated.ranking-v3.tsx`**: substituir o `.from("production_entries").select(...)` + agregação no cliente por `supabase.rpc("get_agency_ranking")`. Manter realtime channel atual (invalidação por evento em `production_entries` filtrado por `agency_id` continua válida — dispara refetch da RPC). Ordem/desempate e "só quem produziu" já batem com a RPC.

**`src/routes/_authenticated.dashboard-v3.tsx`**: o bloco que hoje faz `.from("production_entries").select("user_id, quantity, amount, products(...)")` para montar ranking da agência passa a usar `supabase.rpc("get_agency_ranking")`. O bloco de produção pessoal (linhas ~90) fica intacto — dono lê próprio extrato normalmente.

**`src/hooks/useAuth.tsx`**: `?? "user"` → `?? "viewer"` (linha ~55). Verificar que `AppRole` já inclui `viewer` (o memory diz que sim).

### 3) Tipos
Após aprovação da migration, `src/integrations/supabase/types.ts` é regenerado e expõe `get_agency_ranking` em `Database["public"]["Functions"]`. As chamadas `rpc(...)` ficam tipadas automaticamente.

## Arquivos
- **Criar**: `supabase/migrations/<ts>_agency_ranking_rpc.sql`
- **Editar**: `src/routes/_authenticated.ranking-v3.tsx`, `src/routes/_authenticated.dashboard-v3.tsx`, `src/hooks/useAuth.tsx`, `src/features/production/points.ts` (só comentário)
- **Não tocar**: rotas legadas/v2, `daily_reports` além da policy SELECT gerente, `routeTree.gen.ts`, `calcEntryPoints` lógica, policies de escrita.

## Riscos
- **Divergência TS↔SQL de pontos**: mitigado pelos comentários cruzados + fallback idêntico. Idealmente validar com 1 seed manual depois.
- **RPC `SECURITY DEFINER` vazando ag alheia**: mitigado por `get_user_agency_id(auth.uid())` como único filtro de escopo + `REVOKE FROM anon`.
- **Realtime**: `production_entries` filtrado por `agency_id` no channel do ranking-v3 exige que o cliente enxergue as linhas via RLS para receber eventos. Gerente passa a ver; funcionário só recebe eventos das próprias linhas — aceitável, pois refetch da RPC ainda ocorre no evento próprio; para refresh cross-user, o dashboard já tem interval/refetch on focus (a confirmar durante implementação; se não tiver, adiciono `refetchOnWindowFocus: true` no `useQuery`).
- **`p_month` como `date`**: passar sempre o 1º dia do mês do lado do cliente ou omitir (default cobre "mês corrente"). Ambos call sites vão omitir por ora.

## Critérios de aceite (como vou validar ao final)
1. `select public.get_agency_ranking()` como funcionário retorna linhas de todos os colegas da ag com pts > 0, ordenados corretamente.
2. Funcionário logado NÃO consegue `select * from production_entries where user_id <> auth.uid()` (0 linhas).
3. Gerente logado consegue ler `production_entries`, `daily_reports` e `profiles` da própria ag; NÃO consegue de outra ag.
4. `ranking-v3` e o card de ranking do `dashboard-v3` renderizam via RPC (grep confirma que não há mais `.from("production_entries")` para ranking).
5. Build passa; `useAuth` retorna `"viewer"` quando não há linha em `user_roles`.
6. `supabase--linter` sem novos avisos críticos.