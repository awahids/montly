'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h2 className="mb-8 text-3xl font-bold">Pricing</h2>
        <div className="grid items-start gap-6 md:grid-cols-2">
          <Card className="border-dashed shadow-none">
            <CardHeader className="text-center">
              <CardTitle>Free</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
            </CardHeader>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="text-center">
              <Badge className="mx-auto mb-2">Pro</Badge>
              <CardTitle className="text-3xl font-bold">Rp0</CardTitle>
              <p className="text-sm text-muted-foreground">Intro period</p>
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
