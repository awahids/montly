
'use client';

import { useOffline } from '@/hooks/use-offline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Sync, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, pendingSyncCount, syncPendingChanges } = useOffline();

  if (isOnline && pendingSyncCount === 0) {
    return (
      <Badge variant="outline" className="gap-2 text-green-600 border-green-200">
        <Wifi className="h-3 w-3" />
        Online
      </Badge>
    );
  }

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="gap-2">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  }

  if (pendingSyncCount > 0) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-2 text-amber-600 border-amber-200">
          <AlertCircle className="h-3 w-3" />
          {pendingSyncCount} pending
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={syncPendingChanges}
          className="h-6 px-2 text-xs"
        >
          <Sync className="h-3 w-3 mr-1" />
          Sync
        </Button>
      </div>
    );
  }

  return null;
}
