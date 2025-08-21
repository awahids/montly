import { Wallet, Shield, Server, Moon } from 'lucide-react';

const items = [
  { 
    icon: Wallet, 
    text: 'Manual Input',
    description: 'Enter transactions manually - no bank account connection required',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: Shield, 
    text: 'Private & Secure',
    description: 'Your financial data stays safe and is never shared with third parties',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    icon: Server, 
    text: 'Access Anywhere',
    description: 'Monitor your personal finances from any device',
    color: 'from-purple-500 to-violet-500'
  },
  { 
    icon: Moon, 
    text: 'Simple Design',
    description: 'Clean and intuitive interface that\'s easy to use',
    color: 'from-gray-600 to-gray-800'
  },
];

export function TrustSignals() {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">Trusted by users worldwide</h3>
          <p className="text-muted-foreground">Built with security, privacy, and user experience in mind</p>
        </div>

        <div className="responsive-grid">
          {items.map(({ icon: Icon, text, description, color }, index) => (
            <div
              key={index}
              className="group relative card-enhanced p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div 
                  className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-sm" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-all duration-300">
                    {text}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/90 transition-colors">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
</div>
      </div>
    </section>
  );
}