import { Wallet, Shield, Server, Moon } from 'lucide-react';

const items = [
  { icon: Wallet, text: 'Bank & e-wallet friendly' },
  { icon: Shield, text: 'Privacy-first' },
  { icon: Server, text: 'RLS on Supabase' },
  { icon: Moon, text: 'Dark mode' },
];

export function TrustSignals() {
  return (
    <section className="py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4">
        {items.map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
