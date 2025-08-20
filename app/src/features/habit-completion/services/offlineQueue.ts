import type { OfflineQueueItem } from '../types/completion.types';

const QUEUE_KEY = 'habit_completion_offline_queue';
const MAX_RETRY_COUNT = 3;

class OfflineQueueService {
  private queue: OfflineQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private listeners: Set<(queue: OfflineQueueItem[]) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  enqueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(queueItem);
    this.saveQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  dequeue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  getQueue(): OfflineQueueItem[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const itemsToProcess = [...this.queue];

      for (const item of itemsToProcess) {
        try {
          await this.processQueueItem(item);
          this.dequeue(item.id);
        } catch (error) {
          console.error(`Failed to process queue item ${item.id}:`, error);
          
          // Increment retry count
          const index = this.queue.findIndex(qi => qi.id === item.id);
          if (index !== -1) {
            this.queue[index].retryCount++;
            
            // Remove if max retries exceeded
            if (this.queue[index].retryCount >= MAX_RETRY_COUNT) {
              console.error(`Max retries exceeded for item ${item.id}, removing from queue`);
              this.dequeue(item.id);
            }
          }
        }
      }

      this.saveQueue();
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    // This will be implemented to call the actual API based on item type
    // For now, we'll import the completionApi dynamically to avoid circular dependencies
    const { completionApi } = await import('./completionApi');

    switch (item.type) {
      case 'toggle':
        await completionApi.toggleCompletion(item.habitId!, item.data);
        break;
      case 'complete':
        await completionApi.completeHabit(item.habitId!, item.data);
        break;
      case 'bulk':
        await completionApi.bulkToggleCompletions(item.data);
        break;
      default:
        throw new Error(`Unknown queue item type: ${(item as any).type}`);
    }
  }

  subscribe(listener: (queue: OfflineQueueItem[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.queue));
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  hasFailedItems(): boolean {
    return this.queue.some(item => item.retryCount > 0);
  }

  getFailedItems(): OfflineQueueItem[] {
    return this.queue.filter(item => item.retryCount > 0);
  }

  retryFailedItems(): void {
    const failedItems = this.getFailedItems();
    failedItems.forEach(item => {
      const index = this.queue.findIndex(qi => qi.id === item.id);
      if (index !== -1) {
        this.queue[index].retryCount = 0;
      }
    });
    this.saveQueue();
    this.processSyncQueue();
  }
}

export const offlineQueue = new OfflineQueueService();
export default offlineQueue;