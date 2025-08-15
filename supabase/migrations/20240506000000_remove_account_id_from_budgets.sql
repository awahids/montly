-- Remove account_id from budgets table to make budgets account-agnostic
alter table budgets drop constraint if exists budgets_user_id_month_account_id_key;
alter table budgets drop column if exists account_id;
alter table budgets add constraint budgets_user_id_month_key unique (user_id, month);
