import Image from 'next/image';
import { Wallet, ReceiptText, LayoutDashboard, TrendingUp } from 'lucide-react';

const features = [
  {
    title: 'Accounts',
    description: 'See balances in one view—bank, e-wallet, and cash.',
    icon: Wallet,
    image: 'https://placehold.co/600x400/png?text=Accounts',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Budgets',
    description:
      'Plan per month per account. Allocate by category; roll over what matters.',
    icon: LayoutDashboard,
    image: 'https://placehold.co/600x400/png?text=Budgets',
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Transactions',
    description: 'Add expense, income, or transfer in seconds.',
    icon: ReceiptText,
    image: 'https://placehold.co/600x400/png?text=Transactions',
    color: 'from-purple-500 to-violet-500',
  },
  {
    title: 'Insights',
    description: 'See spend vs. budget and trends.',
    icon: TrendingUp,
    image: 'https://placehold.co/600x400/png?text=Insights',
    color: 'from-orange-500 to-red-500',
  },
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-muted/10 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
      
      {/* Floating background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            Features that matter
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Everything you need to manage your money
          </h2>
          <p className="text-xl text-muted-foreground/90 leading-relaxed">
            Powerful features designed to help you take control of your finances and
            reach your goals faster than ever before.
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 backdrop-blur-sm transform hover:scale-[1.02]"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative">
                <div className="flex items-start gap-6 mb-8">
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="overflow-hidden rounded-2xl border border-border/50 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <div className="relative">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={600}
                        height={400}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  {/* Enhanced feature index */}
                  <div className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-lg font-bold text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-primary/50 rounded-full animate-pulse delay-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-8 py-4 text-lg font-semibold text-primary backdrop-blur-sm hover:from-primary/15 hover:to-primary/10 transition-all duration-300 cursor-pointer group">
            <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start using these features today
            <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}