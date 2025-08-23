
'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '@/lib/offline-storage';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const { toast } = useToast();

  const {
    transactions,
    accounts,
    categories,
    budgets,
    setTransactions,
    setAccounts,
    setCategories,
    setBudgets,
  } = useAppStore();

  // Initialize offline storage and check connectivity
  useEffect(() => {
    const initOffline = async () => {
      try {
        await offlineStorage.init();
        setIsInitialized(true);

        // Load offline data if available
        const offlineData = await offlineStorage.getOfflineData();
        if (offlineData.transactions) setTransactions(offlineData.transactions);
        if (offlineData.accounts) setAccounts(offlineData.accounts);
        if (offlineData.categories) setCategories(offlineData.categories);
        if (offlineData.budgets) setBudgets(offlineData.budgets);

        // Update pending sync count
        const pending = await offlineStorage.getPendingSync();
        setPendingSyncCount(pending.length);
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
      }
    };

    initOffline();
  }, [setTransactions, setAccounts, setCategories, setBudgets]);

  // Sync any pending offline changes when back online
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline) return;

    try {
      const pendingItems = await offlineStorage.getPendingSync();
      if (pendingItems.length === 0) return;

      toast({
        title: 'Syncing data...',
        description: `Syncing ${pendingItems.length} pending changes.`,
      });

      // Process each pending sync item
      for (const item of pendingItems) {
        try {
          const endpoint = `/api/${item.table}${item.action === 'update' || item.action === 'delete' ? `/${item.data.id}` : ''}`;

          let method = 'POST';
          if (item.action === 'update') method = 'PATCH';
          if (item.action === 'delete') method = 'DELETE';

          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined,
          });

          if (!response.ok) {
            throw new Error(`Failed to sync ${item.table} ${item.action}`);
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Continue with other items
        }
      }

      // Clear pending sync after successful sync
      await offlineStorage.clearPendingSync();
      setPendingSyncCount(0);

      toast({
        title: 'Sync completed',
        description: 'All your offline changes have been synced.',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync failed',
        description: 'Some changes could not be synced. Will retry when connection improves.',
        variant: 'destructive',
      });
    }
  }, [isOnline, toast, setPendingSyncCount]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingChanges]);

  // Persist the latest data locally so it can be restored after a refresh
  useEffect(() => {
    if (isInitialized) {
      offlineStorage.saveOfflineData({
        transactions,
        accounts,
        categories,
        budgets,
        lastSync: new Date().toISOString(),
      });
    }
  }, [transactions, accounts, categories, budgets, isInitialized]);

  const addOfflineChange = async (
    action: 'create' | 'update' | 'delete',
    table: 'transactions' | 'accounts' | 'categories' | 'budgets',
    data: any
  ) => {
    if (isOnline) return; // Only add to offline queue when offline

    await offlineStorage.addPendingSync({ action, table, data });
    const pending = await offlineStorage.getPendingSync();
    setPendingSyncCount(pending.length);
  };

  const clearOfflineData = async () => {
    await offlineStorage.clearOfflineData();
    await offlineStorage.clearPendingSync();
    setPendingSyncCount(0);
  };

  return {
    isOnline,
    isInitialized,
    pendingSyncCount,
    syncPendingChanges,
    addOfflineChange,
    clearOfflineData,
  };
}
