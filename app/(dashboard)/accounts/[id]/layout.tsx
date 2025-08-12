import { createServerClient } from '@/lib/supabase';

// export async function generateStaticParams() {
//   const supabase = createServerClient();
//   const { data } = await supabase.from('accounts').select('id');
//   return data?.map(({ id }) => ({ id })) ?? [];
// }

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
