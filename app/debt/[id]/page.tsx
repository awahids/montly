import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function DebtSharePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('debts')
    .select('*')
    .eq('id', params.id)
    .single();
  if (!data) {
    notFound();
  }
  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-bold">Debt Detail</h1>
      <p><strong>Name:</strong> {data.contact}</p>
      <p><strong>Amount:</strong> {data.amount}</p>
      {data.note && <p><strong>Note:</strong> {data.note}</p>}
      <p><strong>Status:</strong> {data.status}</p>
    </div>
  );
}
