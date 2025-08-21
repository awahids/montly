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
    <section className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with your financial journey in just three simple steps
          </p>
        </div>
        
        <ol className="relative grid gap-8 md:grid-cols-3">
          {/* Connection lines */}
          <div className="absolute top-16 left-1/2 hidden md:block w-full max-w-4xl -translate-x-1/2">
            <div className="flex items-center justify-between">
              <div className="h-0.5 w-1/3 bg-gradient-to-r from-primary/50 to-primary"></div>
              <div className="h-0.5 w-1/3 bg-gradient-to-r from-primary to-primary/50"></div>
            </div>
          </div>
          
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex flex-col items-center">
              <div className="group mb-6">
                <div className="relative">
                  {/* Step number with enhanced styling */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-white shadow-colored group-hover:scale-110 transition-transform duration-300">
                    {i + 1}
                  </div>
                  
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse"></div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
              
              {/* Step completion indicator */}
              <div className="mt-4 flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="h-1 w-1 rounded-full bg-primary/60"></div>
                <div className="h-1 w-1 rounded-full bg-primary/30"></div>
              </div>
            </li>
          ))}
        </ol>
        
        {/* Call to action */}
        <div className="mt-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-white font-semibold shadow-colored hover:shadow-lg transition-all-smooth cursor-pointer">
            <span>Ready to get started?</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
