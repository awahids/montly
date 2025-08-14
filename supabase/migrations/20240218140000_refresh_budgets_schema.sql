-- Ensure budgets has account reference and total amount columns and refresh schema cache
alter table public.budgets
  add column if not exists account_id uuid references public.accounts(id),
  add column if not exists total_amount numeric not null default 0;

-- Reload PostgREST schema cache so new columns are recognized
notify pgrst, 'reload schema';
