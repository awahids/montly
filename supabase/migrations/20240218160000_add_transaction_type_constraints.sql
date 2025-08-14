-- Add check constraints for transaction type account requirements
alter table public.transactions
  add constraint transactions_expense_income_accounts_check
  check (
    type not in ('expense', 'income') or
    (account_id is not null and from_account_id is null and to_account_id is null)
  );

alter table public.transactions
  add constraint transactions_transfer_accounts_check
  check (
    type <> 'transfer' or
    (account_id is null and from_account_id is not null and to_account_id is not null)
  );
