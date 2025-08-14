-- Ensure each user has at most one budget per account per month
alter table public.budgets
  drop constraint if exists budgets_user_month_account_unique,
  add constraint budgets_user_month_account_unique unique (user_id, month, account_id);

-- Reload PostgREST schema cache to pick up the new constraint
notify pgrst, 'reload schema';
