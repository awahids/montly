import { create } from 'zustand';
import { User, Account, Category, Transaction, Budget } from '@/types';

interface AppState {
  user: User | null;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getCurrentBalance: (accountId: string) => number;
  getCategorySpending: (categoryId: string, month: string) => number;
  getMonthlySpending: (month: string) => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  loading: false,

  setUser: (user) => set({ user }),
  setAccounts: (accounts) => set({ accounts }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  setBudgets: (budgets) => set({ budgets }),
  setLoading: (loading) => set({ loading }),

  getCurrentBalance: (accountId: string) => {
    const { accounts, transactions } = get();
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 0;

    const accountTransactions = transactions.filter(t => 
      t.accountId === accountId || t.fromAccountId === accountId || t.toAccountId === accountId
    );

    let balance = account.openingBalance;
    
    accountTransactions.forEach(t => {
      if (t.type === 'income' && t.accountId === accountId) {
        balance += t.amount;
      } else if (t.type === 'expense' && t.accountId === accountId) {
        balance -= t.amount;
      } else if (t.type === 'transfer') {
        if (t.fromAccountId === accountId) {
          balance -= t.amount;
        } else if (t.toAccountId === accountId) {
          balance += t.amount;
        }
      }
    });

    return balance;
  },

  getCategorySpending: (categoryId: string, month: string) => {
    const { transactions } = get();
    const monthStart = `${month}-01`;
    const monthEnd = `${month}-31`;
    
    return transactions
      .filter(t => 
        t.categoryId === categoryId && 
        t.type === 'expense' &&
        t.date >= monthStart && 
        t.date <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getMonthlySpending: (month: string) => {
    const { transactions } = get();
    const monthStart = `${month}-01`;
    const monthEnd = `${month}-31`;
    
    return transactions
      .filter(t =>
        t.type === 'expense' &&
        t.date >= monthStart &&
        t.date <= monthEnd
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },
}));