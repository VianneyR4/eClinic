'use client';

import { useSyncStatus } from '../sync/syncStatus';
import { Wifi, Refresh, InfoCircle, CloseCircle } from 'iconsax-react';

export default function SyncIndicator() {
  const { syncStatus } = useSyncStatus();

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.isSyncing) return 'text-blue-500';
    if (syncStatus.error) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.error) return 'Sync Error';
    if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} pending`;
    return 'Synced';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <CloseCircle size={16} className="text-red-500" />;
    }
    if (syncStatus.isSyncing) {
      return <Refresh size={16} className="text-blue-500 animate-spin" />;
    }
    if (syncStatus.error) {
      return <InfoCircle size={16} className="text-yellow-500" />;
    }
    return <Wifi size={16} className="text-green-500" />;
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 bg-white rounded-full border border-gray-200" style={{ height: 35 }}>
      {getStatusIcon()}
      <span className={`text-xs font-medium ${getStatusColor()} hidden sm:inline`}>
        {getStatusText()}
      </span>
      {syncStatus.lastSyncTime && (
        <span className="text-xs text-gray-500 hidden md:inline">
          {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

