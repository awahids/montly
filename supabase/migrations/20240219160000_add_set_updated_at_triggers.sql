-- Function to automatically update the updated_at column
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Accounts
 drop trigger if exists set_updated_at_accounts on public.accounts;
create trigger set_updated_at_accounts
  before update on public.accounts
  for each row execute procedure public.set_updated_at();

-- Categories
 drop trigger if exists set_updated_at_categories on public.categories;
create trigger set_updated_at_categories
  before update on public.categories
  for each row execute procedure public.set_updated_at();

-- Transactions
 drop trigger if exists set_updated_at_transactions on public.transactions;
create trigger set_updated_at_transactions
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- Budgets
 drop trigger if exists set_updated_at_budgets on public.budgets;
create trigger set_updated_at_budgets
  before update on public.budgets
  for each row execute procedure public.set_updated_at();

-- Budget items
 drop trigger if exists set_updated_at_budget_items on public.budget_items;
create trigger set_updated_at_budget_items
  before update on public.budget_items
  for each row execute procedure public.set_updated_at();

-- Profiles
 drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
