'use client';

import { AccountForm } from '@/components/accounts/account-form';

export default function NewAccountPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add Account</h2>
        <p className="text-muted-foreground">Create a new account.</p>
      </div>
      <AccountForm />
    </div>
  );
}

