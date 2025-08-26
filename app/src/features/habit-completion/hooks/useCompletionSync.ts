import { useState, useEffect, useCallback } from 'react';
import { offlineQueue } from '../services/offlineQueue';
import type { OfflineQueueItem } from '../types/completion.types';

export function useCompletionSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [failedItems, setFailedItems] = useState<OfflineQueueItem[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const unsubscribe = offlineQueue.subscribe(queue => {
      setQueueSize(queue.length);
      setFailedItems(queue.filter(item => item.retryCount > 0));
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync if online
    if (navigator.onLine) {
      syncQueue();
    }

    // Set initial queue size
    setQueueSize(offlineQueue.getQueueSize());
    setFailedItems(offlineQueue.getFailedItems());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const syncQueue = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await offlineQueue.processSyncQueue();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const retryFailed = useCallback(() => {
    offlineQueue.retryFailedItems();
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueue.clearQueue();
  }, []);

  return {
    isOnline,
    queueSize,
    isSyncing,
    failedItems,
    syncQueue,
    retryFailed,
    clearQueue,
    hasFailedItems: failedItems.length > 0,
  };
}
