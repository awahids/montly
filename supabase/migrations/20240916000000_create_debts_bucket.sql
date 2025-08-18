insert into storage.buckets (id, name, public)
values ('debts', 'debts', true)
on conflict (id) do nothing;

create policy "Public read access for debts" on storage.objects
  for select using (bucket_id = 'debts');

create policy "Authenticated users can upload debts" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'debts');

create policy "Users can delete own debts" on storage.objects
  for delete to authenticated
  using (bucket_id = 'debts' and auth.uid() = owner);
