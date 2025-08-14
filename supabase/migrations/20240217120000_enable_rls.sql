-- Enable row level security and policies for user-owned tables

-- Function to auto-fill user_id
create or replace function public.handle_user_id()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Accounts
alter table public.accounts enable row level security;
create policy "Users manage own accounts" on public.accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger set_user_id_accounts
  before insert on public.accounts
  for each row execute procedure public.handle_user_id();

-- Categories
alter table public.categories enable row level security;
create policy "Users manage own categories" on public.categories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger set_user_id_categories
  before insert on public.categories
  for each row execute procedure public.handle_user_id();

-- Transactions
alter table public.transactions enable row level security;
create policy "Users manage own transactions" on public.transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger set_user_id_transactions
  before insert on public.transactions
  for each row execute procedure public.handle_user_id();

-- Budgets
alter table public.budgets enable row level security;
create policy "Users manage own budgets" on public.budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger set_user_id_budgets
  before insert on public.budgets
  for each row execute procedure public.handle_user_id();

-- Budget items
alter table public.budget_items enable row level security;
create policy "Users manage own budget items" on public.budget_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger set_user_id_budget_items
  before insert on public.budget_items
  for each row execute procedure public.handle_user_id();

-- Profiles
alter table public.profiles enable row level security;
create policy "Users manage own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);
