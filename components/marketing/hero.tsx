'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Budget monthly. Track daily. All in one place.
      </h1>
      <p className="max-w-2xl text-muted-foreground">
        Connect bank & e-wallet accounts, set monthly budgets, and stay on top of every transaction.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild onClick={() => window.umami?.track('cta_hero_click')}>
          <Link href="/auth/sign-up">Get Started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="#features">See How It Works</Link>
        </Button>
      </div>
      <Image
        src="https://placehold.co/1200x800/png?text=Dashboard"
        alt="Monli dashboard screenshot"
        width={1200}
        height={800}
        className="w-full max-w-5xl rounded-lg"
        priority
      />
    </section>
  );
}
