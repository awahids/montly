import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import ZakatCalculator from './zakat-calculator';

export default async function ZakatPage() {
  const supabase = createServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect('/auth/sign-in?next=/zakat');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', auth.user.id)
    .single();
  const plan = profile?.plan === 'PRO' ? 'PRO' : 'FREE';

  return <ZakatCalculator plan={plan} />;
}
