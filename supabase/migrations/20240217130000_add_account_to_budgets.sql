-- Create budgets table if it does not yet exist so older databases can
-- apply this migration without errors. The latest schema already includes
-- the account reference and total amount columns.
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  month text not null,
  account_id uuid not null references public.accounts(id),
  total_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure the table has the required columns when it already exists
alter table if exists public.budgets
  add column if not exists account_id uuid references public.accounts(id) not null,
  add column if not exists total_amount numeric not null default 0;

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
