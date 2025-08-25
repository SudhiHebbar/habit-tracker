import React, { useEffect, useCallback } from 'react';
import type { TrackerSummary } from '../types/trackerSwitching.types';

interface TrackerQuickSwitchProps {
  trackers: TrackerSummary[];
  activeTrackerId: number | null;
  onSwitch: (trackerId: number) => void;
}

export const TrackerQuickSwitch: React.FC<TrackerQuickSwitchProps> = ({
  trackers,
  activeTrackerId,
  onSwitch,
}) => {
  const handleKeyboardShortcut = useCallback(
    (event: KeyboardEvent) => {
      // Check for Ctrl/Cmd + number (1-9)
      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
        event.preventDefault();

        const index = parseInt(event.key) - 1;
        if (index < trackers.length) {
          const tracker = trackers[index];
          if (tracker.id !== activeTrackerId) {
            onSwitch(tracker.id);
          }
        }
      }

      // Check for Alt + arrow keys for next/previous
      if (event.altKey) {
        const currentIndex = trackers.findIndex(t => t.id === activeTrackerId);

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % trackers.length;
          onSwitch(trackers[nextIndex].id);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : trackers.length - 1;
          onSwitch(trackers[prevIndex].id);
        }
      }

      // Ctrl/Cmd + K for quick search (would open dropdown)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // This would trigger opening the dropdown with search focus
        const dropdownTrigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement;
        dropdownTrigger?.click();
      }
    },
    [trackers, activeTrackerId, onSwitch]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcut);
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [handleKeyboardShortcut]);

  // This component doesn't render anything visible
  // It only handles keyboard shortcuts
  return null;
};
