'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-8 text-3xl font-bold">Pricing</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Coming soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monli Pro — Rp0 (intro period)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-left">
                <li>Unlimited accounts</li>
                <li>Unlimited budgets</li>
                <li>Unlimited transactions</li>
                <li>Export soon</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                asChild
                onClick={() => window.umami?.track('cta_pricing_click')}
              >
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
