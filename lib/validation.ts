import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['bank', 'ewallet', 'cash']),
  currency: z.string().min(1),
  opening_balance: z.number().nonnegative().default(0),
  archived: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['expense', 'income']),
  color: z.string().optional(),
  icon: z.string().optional(),
});

const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format. Use YYYY-MM');

export const budgetItemSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().nonnegative(),
  rollover: z.boolean().default(false),
});

export const budgetItemsAddSchema = z.object({
  items: z.array(budgetItemSchema),
});

export const budgetItemPatchSchema = budgetItemSchema.partial();

export const budgetSchema = z.object({
  month: monthSchema,
  items: z.array(budgetItemSchema).default([]),
});

export const budgetPatchSchema = z.object({
  month: monthSchema.optional(),
  items: z.array(budgetItemSchema).optional(),
});

export const transactionSchema = z.object({
  date: z.string(),
  type: z.enum(['expense', 'income', 'transfer']),
  accountId: z.string().uuid().nullable().optional(),
  fromAccountId: z.string().uuid().nullable().optional(),
  toAccountId: z.string().uuid().nullable().optional(),
  amount: z.number(),
  categoryId: z.string().uuid().nullable().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
