import { useState, useEffect, useCallback } from 'react';
import { offlineQueue } from '../services/offlineQueue';
import type { OfflineQueueItem } from '../types/completion.types';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Subscribe to queue updates
    const unsubscribe = offlineQueue.subscribe((updatedQueue) => {
      setQueue(updatedQueue);
    });

    // Set initial queue
    setQueue(offlineQueue.getQueue());

    return unsubscribe;
  }, []);

  const addToQueue = useCallback((
    type: 'toggle' | 'complete' | 'bulk',
    habitId: number | undefined,
    data: any
  ) => {
    offlineQueue.enqueue({
      type,
      habitId: habitId || 0,
      data
    });
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    offlineQueue.dequeue(id);
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await offlineQueue.processSyncQueue();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const clearQueue = useCallback(() => {
    offlineQueue.clearQueue();
  }, []);

  const retryFailedItems = useCallback(() => {
    offlineQueue.retryFailedItems();
  }, []);

  return {
    queue,
    queueSize: queue.length,
    isProcessing,
    isOnline: offlineQueue.getIsOnline(),
    hasFailedItems: offlineQueue.hasFailedItems(),
    failedItems: queue.filter(item => item.retryCount > 0),
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    retryFailedItems
  };
}