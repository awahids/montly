-- Create core tables for profiles, accounts, categories, transactions, budgets, and budget items
create table public.profiles (
  id uuid primary key references auth.users(id),
  email text not null unique,
  name text not null,
  default_currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  name text not null,
  type text not null check (type in ('bank','ewallet','cash')),
  currency text not null,
  opening_balance numeric not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  name text not null,
  type text not null check (type in ('expense','income')),
  color text not null,
  icon text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  month text not null,
  account_id uuid not null references public.accounts(id),
  total_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  amount numeric not null,
  rollover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  date date not null,
  type text not null check (type in ('expense','income','transfer')),
  account_id uuid references public.accounts(id),
  from_account_id uuid references public.accounts(id),
  to_account_id uuid references public.accounts(id),
  amount numeric not null,
  category_id uuid references public.categories(id),
  note text not null default '',
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
