import { Account } from '@/types';
import { AccountForm } from '@/components/accounts/account-form';
import { createServerClient } from '@/lib/supabase';

const toCamel = (str: string) =>
  str.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());

function keysToCamel<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v)) as any;
  }
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[toCamel(key)] = keysToCamel(value);
    }
    return result as T;
  }
  return obj as T;
}

interface PageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('accounts').select('id');
    return data?.map(({ id }) => ({ id })) ?? [];
  } catch {
    return [];
  }
}

export default async function EditAccountPage({ params }: PageProps) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', params.id)
    .single();

  const account = data ? keysToCamel<Account>(data) : null;

  if (!account) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Account</h2>
        <p className="text-muted-foreground">Update account details.</p>
      </div>
      <AccountForm account={account} />
    </div>
  );
}
