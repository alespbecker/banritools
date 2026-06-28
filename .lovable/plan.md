
## Objetivo
Gerar dados realistas o suficiente para você abrir as telas de relatório e exportar (PDF/XLSX/CSV) e ver como ficam — sem poluir o banco real e sem criar contas de login.

## Abordagem recomendada: seed SQL temporário com rollback fácil

Em vez de criar 10 contas no Supabase Auth (que exigiria service role, e-mails, limpeza no `auth.users` etc.), faço um seed só nas tabelas de domínio (`profiles`, `production_entries`) marcando todos os registros com uma flag de origem para apagar tudo em 1 comando depois.

### Como fica

1. **Migração 1 — `seed_demo`**
   - Insere 10 linhas em `public.profiles` com `id = gen_random_uuid()`, nomes fictícios ("Demo - Ana", "Demo - Bruno"…), cargos variados, mesma `agency_id` da sua agência atual.
   - Insere ~10 dias × 10 usuários de `production_entries` distribuídos pelos produtos existentes, com quantidades aleatórias plausíveis (cartões 0–5/dia, seguros 0–3/dia, consórcios 0–1/dia etc.), `status = 'aprovado'`, datas nos últimos 10 dias.
   - Marca tudo com um campo identificável — uso o prefixo `Demo - ` no `full_name` do profile e `metadata->>'demo' = 'true'` (ou um comentário) nas entries para conseguir limpar.
   - **Não cria** linhas em `auth.users`, `user_roles`, `user_points`, `daily_reports`, gamificação. Só o necessário para o relatório.

2. **Você abre o Painel da Agência / Usuários / Exporta** o PDF/XLSX que quiser revisar visualmente.

3. **Migração 2 — `cleanup_demo`** (rodo quando você disser "pode limpar")
   - `DELETE FROM production_entries WHERE user_id IN (SELECT id FROM profiles WHERE full_name LIKE 'Demo - %');`
   - `DELETE FROM profiles WHERE full_name LIKE 'Demo - %';`
   - Banco volta exatamente ao estado atual.

### Por que essa solução e não outras

- **Não usar Auth Admin API**: criar 10 usuários reais no `auth.users` exigiria service role + cleanup em schema protegido, e contamina logs de auth para um teste visual.
- **Não mockar no front**: você quer ver o **export real** (PDF/XLSX gerados pelo `ExportDialog`), que lê do banco. Mockar no front não exercita o pipeline real.
- **Não usar uma agência "demo" separada**: como admin você já vê tudo, e criar agência nova exigiria filtrar em várias telas. Usar a sua agência atual + flag de nome é mais simples e reversível.

### Risco / cuidado
- Como uso a sua `agency_id`, os 10 demos aparecem misturados aos dados reais no Painel da Agência enquanto não rodarmos o cleanup. Como hoje a produção real está zerada (você limpou recentemente), isso fica limpo: tudo que aparecer é demo.
- Não toco em `user_roles`, então os demos não conseguem logar nem aparecem como gestores.

## Próximos passos
Se aprovar, eu:
1. Confirmo qual é sua `agency_id` e os `product_id`s ativos com uma `read_query`.
2. Rodo a migração `seed_demo`.
3. Te aviso para abrir os relatórios e exportar.
4. Quando me disser, rodo `cleanup_demo`.

Quer assim, ou prefere variação (ex.: 30 dias, mais/menos usuários, agência separada)?
