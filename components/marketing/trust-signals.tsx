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
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, text, description, color }, index) => (
            <div 
              key={text} 
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transform hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                  <Icon className="h-8 w-8 text-white drop-shadow-sm" />
                </div>
                <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-all duration-300 mb-3">
                  {text}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-muted-foreground/90 transition-colors">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
