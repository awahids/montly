/*
  # Fix budget_items RLS policies

  The budget_items table doesn't have a user_id column directly.
  It needs to access the user through the budgets table relationship.

  1. Drop incorrect policies and triggers for budget_items
  2. Create correct RLS policies using the budgets relationship
  3. Remove the incorrect trigger that tries to set user_id
*/

-- Drop the incorrect policies for budget_items
DROP POLICY IF EXISTS "Users select own budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users insert own budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users update own budget items" ON public.budget_items;
DROP POLICY IF EXISTS "Users delete own budget items" ON public.budget_items;

-- Drop the incorrect trigger that tries to set user_id on budget_items
DROP TRIGGER IF EXISTS set_user_id_budget_items ON public.budget_items;

-- Create correct RLS policies for budget_items using the budgets relationship
CREATE POLICY "Users can select own budget items" ON public.budget_items
  FOR SELECT USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own budget items" ON public.budget_items
  FOR INSERT WITH CHECK (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own budget items" ON public.budget_items
  FOR UPDATE USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own budget items" ON public.budget_items
  FOR DELETE USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );