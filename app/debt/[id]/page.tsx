import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export default async function DebtSharePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('debts')
    .select('*')
    .eq('share_id', params.id)
    .single();
  if (!data) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debt Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Name:</strong> {data.contact}
          </p>
          <p>
            <strong>Amount:</strong> {data.amount}
          </p>
          {data.note && (
            <p>
              <strong>Note:</strong> {data.note}
            </p>
          )}
          <p>
            <strong>Status:</strong> {data.status}
          </p>
          {Array.isArray(data.attachments) && data.attachments.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {data.attachments.map((url: string) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={url}
                    alt="attachment"
                    className="w-full h-32 object-cover rounded hover:opacity-90"
                  />
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
