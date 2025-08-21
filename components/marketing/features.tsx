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
    <section className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-6 text-xl text-muted-foreground">
            Powerful features to help you take control of your finances and
            reach your goals faster.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 shadow-sm transition-all-smooth hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 backdrop-blur-sm"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-colored group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 relative">
                  <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Feature index */}
                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                    {index + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start using these features today
          </div>
        </div>
      </div>
    </section>
  );
}