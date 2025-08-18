-- Create debts table
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  contact text not null,
  amount numeric not null,
  note text,
  type text not null check (type in ('debt','credit')),
  status text not null default 'unpaid' check (status in ('unpaid','paid')),
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table debts enable row level security;
create policy "Debts are accessible by owner" on debts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger update_debts_updated_at before update on debts
  for each row execute procedure update_updated_at_column();
create index debts_user_id_idx on debts(user_id);
