import { Card, CardContent } from '@/components/ui/card';

const quotes = [
  {
    quote: '“Monli helps me keep tabs on every rupiah.”',
    author: 'Beta User',
  },
  {
    quote: '“Budgeting finally makes sense.”',
    author: 'Early Adopter',
  },
  {
    quote: '“Clean design and dark mode—love it.”',
    author: 'Night Owl',
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl space-y-8 text-center">
        <h2 className="text-3xl font-bold">What users say</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {quotes.map(q => (
            <Card key={q.author}>
              <CardContent className="pt-6">
                <p className="text-sm">{q.quote}</p>
                <p className="mt-4 text-sm font-medium">{q.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
