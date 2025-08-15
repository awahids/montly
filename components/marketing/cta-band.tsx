import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTABand() {
  return (
    <section className="px-4 py-24 text-center">
      <h2 className="mb-4 text-3xl font-bold">Take control of your money with Monli</h2>
      <Button asChild>
        <Link href="/auth/sign-up">Get Started</Link>
      </Button>
    </section>
  );
}
