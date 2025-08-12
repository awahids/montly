import BudgetDetailClient from './budget-detail-client';
import { createServerClient } from '@/lib/supabase';

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase.from('budgets').select('id');
  return data?.map(({ id }) => ({ id })) ?? [];
}

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <BudgetDetailClient params={params} />;
}
