import { useState, useCallback, useEffect } from 'react';

const HISTORY_KEY = 'trackerNavigationHistory';
const MAX_HISTORY_SIZE = 20;

interface HistoryEntry {
  trackerId: number;
  timestamp: number;
}

export function useTrackerHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return history.length > 0 ? history.length - 1 : -1;
  });

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save tracker history:', e);
    }
  }, [history]);

  const addToHistory = useCallback((trackerId: number) => {
    setHistory(prev => {
      const now = Date.now();
      const newEntry: HistoryEntry = { trackerId, timestamp: now };
      
      // If we're not at the end of history, remove everything after current position
      let newHistory = currentIndex < prev.length - 1 
        ? prev.slice(0, currentIndex + 1)
        : [...prev];
      
      // Don't add duplicate consecutive entries
      const lastEntry = newHistory[newHistory.length - 1];
      if (lastEntry?.trackerId === trackerId) {
        return prev;
      }
      
      // Add new entry
      newHistory.push(newEntry);
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory = newHistory.slice(-MAX_HISTORY_SIZE);
      }
      
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const canGoBack = useCallback(() => {
    return currentIndex > 0;
  }, [currentIndex]);

  const canGoForward = useCallback(() => {
    return currentIndex < history.length - 1;
  }, [currentIndex, history.length]);

  const goBack = useCallback(() => {
    if (!canGoBack()) return null;
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex]?.trackerId || null;
  }, [currentIndex, history, canGoBack]);

  const goForward = useCallback(() => {
    if (!canGoForward()) return null;
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex]?.trackerId || null;
  }, [currentIndex, history, canGoForward]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.warn('Failed to clear tracker history:', e);
    }
  }, []);

  const getRecentTrackers = useCallback((count: number = 5): number[] => {
    const uniqueTrackers = new Set<number>();
    
    // Start from the most recent and work backwards
    for (let i = history.length - 1; i >= 0 && uniqueTrackers.size < count; i--) {
      uniqueTrackers.add(history[i].trackerId);
    }
    
    return Array.from(uniqueTrackers);
  }, [history]);

  const getMostVisited = useCallback((count: number = 5): { trackerId: number; visits: number }[] => {
    const visitCounts = new Map<number, number>();
    
    history.forEach(entry => {
      const current = visitCounts.get(entry.trackerId) || 0;
      visitCounts.set(entry.trackerId, current + 1);
    });
    
    return Array.from(visitCounts.entries())
      .map(([trackerId, visits]) => ({ trackerId, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, count);
  }, [history]);

  const getHistoryStats = useCallback(() => {
    const uniqueTrackers = new Set(history.map(h => h.trackerId));
    const totalVisits = history.length;
    const averageVisitsPerTracker = totalVisits / (uniqueTrackers.size || 1);
    
    return {
      totalVisits,
      uniqueTrackers: uniqueTrackers.size,
      averageVisitsPerTracker,
      currentPosition: currentIndex + 1,
      historyLength: history.length
    };
  }, [history, currentIndex]);

  return {
    history,
    currentIndex,
    addToHistory,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    clearHistory,
    getRecentTrackers,
    getMostVisited,
    getHistoryStats
  };
}