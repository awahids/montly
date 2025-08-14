-- Ensure budgets.account_id references accounts.id so PostgREST can join tables
alter table public.budgets
  drop constraint if exists budgets_account_id_fkey,
  add constraint budgets_account_id_fkey
    foreign key (account_id) references public.accounts(id) on delete cascade;

-- Reload PostgREST schema cache to pick up the new relationship
notify pgrst, 'reload schema';
