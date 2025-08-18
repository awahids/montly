export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          default_currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          default_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          default_currency?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'bank' | 'ewallet' | 'cash';
          currency: string;
          opening_balance: number;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'bank' | 'ewallet' | 'cash';
          currency?: string;
          opening_balance?: number;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: 'bank' | 'ewallet' | 'cash';
          currency?: string;
          opening_balance?: number;
          archived?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'expense' | 'income';
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'expense' | 'income';
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: 'expense' | 'income';
          color?: string;
          icon?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          month?: string;
          total_amount?: number;
          updated_at?: string;
        };
      };
      budget_items: {
        Row: {
          id: string;
          budget_id: string;
          category_id: string;
          amount: number;
          rollover: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          budget_id: string;
          category_id: string;
          amount: number;
          rollover?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          amount?: number;
          rollover?: boolean;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          actual_date: string;
          budget_month: string;
          type: 'expense' | 'income' | 'transfer';
          account_id: string | null;
          from_account_id: string | null;
          to_account_id: string | null;
          amount: number;
          category_id: string | null;
          note: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          actual_date?: string;
          budget_month?: string;
          type: 'expense' | 'income' | 'transfer';
          account_id?: string | null;
          from_account_id?: string | null;
          to_account_id?: string | null;
          amount: number;
          category_id?: string | null;
          note?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          date?: string;
          actual_date?: string;
          budget_month?: string;
          type?: 'expense' | 'income' | 'transfer';
          account_id?: string | null;
          from_account_id?: string | null;
          to_account_id?: string | null;
          amount?: number;
          category_id?: string | null;
          note?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          contact: string;
          amount: number;
          note: string;
          type: 'debt' | 'credit';
          status: 'unpaid' | 'paid';
          due_date: string | null;
          share_id: string;
          attachments: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact: string;
          amount: number;
          note?: string;
          type: 'debt' | 'credit';
          status?: 'unpaid' | 'paid';
          due_date?: string | null;
          share_id?: string;
          attachments?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          contact?: string;
          amount?: number;
          note?: string;
          type?: 'debt' | 'credit';
          status?: 'unpaid' | 'paid';
          due_date?: string | null;
          share_id?: string;
          attachments?: string[];
          updated_at?: string;
        };
      };
    };
  };
}