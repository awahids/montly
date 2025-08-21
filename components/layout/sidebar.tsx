
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Package2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Accounts', href: '/accounts', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Essential navigation for mobile (most used features)
const mobileNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-card border-r border-border overflow-y-auto">
        <div className="px-3 py-4">
          <h2 className="text-xl font-bold text-foreground">FinanceApp</h2>
          <p className="text-sm text-muted-foreground mt-1">Personal Finance Manager</p>
        </div>

        <nav className="mt-6 flex-grow px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9 rounded-full hover:bg-primary/10 transition-all duration-200"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="px-3 py-4 border-b">
            <h2 className="text-xl font-bold text-foreground">FinanceApp</h2>
            <p className="text-sm text-muted-foreground mt-1">Personal Finance Manager</p>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1">
            {mobileNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                href="/accounts"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/accounts'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                Accounts
              </Link>
              <Link
                href="/reports"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/reports'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Reports
              </Link>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
