'use client';

import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  pendingChanges: number;
}

export const useSyncStatus = () => {
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline,
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    pendingChanges: 0,
  });

  useEffect(() => {
    setSyncStatus((prev) => ({ ...prev, isOnline }));
  }, [isOnline]);

  const updateSyncStatus = (updates: Partial<SyncStatus>) => {
    setSyncStatus((prev) => ({ ...prev, ...updates }));
  };

  const setSyncing = (isSyncing: boolean) => {
    updateSyncStatus({ isSyncing });
  };

  const setLastSyncTime = (time: Date) => {
    updateSyncStatus({ lastSyncTime: time });
  };

  const setError = (error: string | null) => {
    updateSyncStatus({ error });
  };

  const setPendingChanges = (count: number) => {
    updateSyncStatus({ pendingChanges: count });
  };

  return {
    syncStatus,
    updateSyncStatus,
    setSyncing,
    setLastSyncTime,
    setError,
    setPendingChanges,
  };
};

export default useSyncStatus;

