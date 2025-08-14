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
create policy "Users select own accounts" on public.accounts
  for select using (auth.uid() = user_id);
create policy "Users insert own accounts" on public.accounts
  for insert with check (auth.uid() = user_id);
create policy "Users update own accounts" on public.accounts
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own accounts" on public.accounts
  for delete using (auth.uid() = user_id);
create trigger set_user_id_accounts
  before insert on public.accounts
  for each row execute procedure public.handle_user_id();

-- Categories
alter table public.categories enable row level security;
create policy "Users select own categories" on public.categories
  for select using (auth.uid() = user_id);
create policy "Users insert own categories" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "Users update own categories" on public.categories
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own categories" on public.categories
  for delete using (auth.uid() = user_id);
create trigger set_user_id_categories
  before insert on public.categories
  for each row execute procedure public.handle_user_id();

-- Transactions
alter table public.transactions enable row level security;
create policy "Users select own transactions" on public.transactions
  for select using (auth.uid() = user_id);
create policy "Users insert own transactions" on public.transactions
  for insert with check (auth.uid() = user_id);
create policy "Users update own transactions" on public.transactions
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own transactions" on public.transactions
  for delete using (auth.uid() = user_id);
create trigger set_user_id_transactions
  before insert on public.transactions
  for each row execute procedure public.handle_user_id();

-- Budgets
alter table public.budgets enable row level security;
create policy "Users select own budgets" on public.budgets
  for select using (auth.uid() = user_id);
create policy "Users insert own budgets" on public.budgets
  for insert with check (auth.uid() = user_id);
create policy "Users update own budgets" on public.budgets
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own budgets" on public.budgets
  for delete using (auth.uid() = user_id);
create trigger set_user_id_budgets
  before insert on public.budgets
  for each row execute procedure public.handle_user_id();

-- Budget items
alter table public.budget_items enable row level security;
create policy "Users select own budget items" on public.budget_items
  for select using (auth.uid() = user_id);
create policy "Users insert own budget items" on public.budget_items
  for insert with check (auth.uid() = user_id);
create policy "Users update own budget items" on public.budget_items
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own budget items" on public.budget_items
  for delete using (auth.uid() = user_id);
create trigger set_user_id_budget_items
  before insert on public.budget_items
  for each row execute procedure public.handle_user_id();

-- Profiles
alter table public.profiles enable row level security;
create policy "Users select own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "Users delete own profile" on public.profiles
  for delete using (auth.uid() = id);
