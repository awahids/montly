-- Add account reference and total amount to budgets
alter table public.budgets
  add column account_id uuid references public.accounts(id) not null,
  add column total_amount numeric not null default 0;

-- Ensure users can only manage budgets for accounts they own
drop policy if exists "Users manage own budgets" on public.budgets;
create policy "Users manage own budgets" on public.budgets for all
  using (
    auth.uid() = user_id and
    account_id in (select id from public.accounts where user_id = auth.uid())
  )
  with check (
    auth.uid() = user_id and
    account_id in (select id from public.accounts where user_id = auth.uid())
  );
