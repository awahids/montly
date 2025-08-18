alter table debts add column share_id uuid not null default gen_random_uuid() unique;
alter table debts add column attachments text[] not null default '{}'::text[];
create policy "Public read debts" on debts for select using (true);
