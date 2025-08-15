const steps = [
  {
    title: 'Create account',
    description: 'Sign up in seconds.',
  },
  {
    title: 'Add accounts & categories',
    description: 'Connect banks and set spending buckets.',
  },
  {
    title: 'Set budget & log transactions',
    description: 'Stay on top every day.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h2 className="mb-8 text-3xl font-bold">How It Works</h2>
        <ol className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
