
'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  withPadding?: boolean;
  withSafeArea?: boolean;
}

export function MobileContainer({ 
  children, 
  className, 
  withPadding = true, 
  withSafeArea = true 
}: MobileContainerProps) {
  return (
    <div 
      className={cn(
        'w-full',
        withPadding && 'mobile-padding px-4 sm:px-6',
        withSafeArea && 'mobile-safe-area',
        className
      )}
    >
      {children}
    </div>
  );
}

export default MobileContainer;
