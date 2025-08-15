import Image from 'next/image';
import { Wallet, ReceiptText, LayoutDashboard } from 'lucide-react';

const features = [
  {
    title: 'Accounts',
    description: 'See balances in one view—bank, e-wallet, and cash.',
    icon: Wallet,
    image: 'https://placehold.co/600x400/png?text=Accounts',
  },
  {
    title: 'Budgets',
    description:
      'Plan per month per account. Allocate by category; roll over what matters.',
    icon: LayoutDashboard,
    image: 'https://placehold.co/600x400/png?text=Budgets',
  },
  {
    title: 'Transactions',
    description: 'Add expense, income, or transfer in seconds.',
    icon: ReceiptText,
    image: 'https://placehold.co/600x400/png?text=Transactions',
  },
  {
    title: 'Insights',
    description: 'See spend vs. budget and trends.',
    icon: LayoutDashboard,
    image: 'https://placehold.co/600x400/png?text=Insights',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4">
        {features.map(({ title, description, icon: Icon, image }) => (
          <div key={title} className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <Image
              src={image}
              alt={`${title} screenshot`}
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
