import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { HabitCard } from '../HabitCard';
import { IconLibrary } from '../../../visual-customization/services/iconLibrary';
import type { Habit } from '../../types/habit.types';

// Mock the useCompletion hook since we're only testing icon rendering
vi.mock('../../../habit-completion/hooks/useCompletion', () => ({
  useCompletion: () => ({
    stats: { totalCompletions: 0 },
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
  }),
}));

// Mock LazyHabitHistory component to avoid complex dependencies
vi.mock('../../../dashboard/components/LazyHabitHistory', () => ({
  LazyHabitHistory: () => <div data-testid='habit-history'>Habit History</div>,
}));

// Mock CompletionCheckbox to focus on icon testing
vi.mock('../../../habit-completion/components/CompletionCheckbox', () => ({
  CompletionCheckbox: () => <div data-testid='completion-checkbox'>Checkbox</div>,
}));

describe('HabitCard Icon Rendering', () => {
  const createMockHabit = (overrides: Partial<Habit> = {}): Habit => ({
    id: 1,
    name: 'Test Habit',
    description: 'Test description',
    color: '#10B981',
    icon: 'water-drop',
    targetFrequency: 'Daily',
    targetCount: 1,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    trackerId: 1,
    lastCompletedDate: null,
    completionsThisWeek: 0,
    currentStreak: 0,
    ...overrides,
  });

  describe('IconLibrary integration', () => {
    it('should render icon from IconLibrary service for valid icon ID', () => {
      const habit = createMockHabit({ icon: 'water-drop' });

      render(<HabitCard habit={habit} />);

      // The icon should be rendered as SVG content
      const iconContainer = document.querySelector('.habitIcon');
      expect(iconContainer).toBeInTheDocument();

      // Check that IconLibrary can find the icon
      const iconSvg = IconLibrary.getIconSvgById('water-drop');
      expect(iconSvg).toBeTruthy();
      expect(iconSvg).toContain('<svg');
    });

    it('should render common icons correctly', () => {
      const commonIcons = ['heart', 'water-drop', 'dumbbell', 'book', 'star'];

      commonIcons.forEach(iconId => {
        const habit = createMockHabit({ icon: iconId });

        const { unmount } = render(<HabitCard habit={habit} />);

        // Verify the icon exists in IconLibrary
        const iconSvg = IconLibrary.getIconSvgById(iconId);
        expect(iconSvg).toBeTruthy();
        expect(iconSvg).toContain('<svg');

        // Verify icon container is rendered
        const iconContainer = document.querySelector('.habitIcon');
        expect(iconContainer).toBeInTheDocument();

        unmount();
      });
    });

    it('should show fallback for missing icon', () => {
      const habit = createMockHabit({ icon: 'nonexistent-icon' });

      render(<HabitCard habit={habit} />);

      const iconContainer = document.querySelector('.habitIcon');
      expect(iconContainer).toBeInTheDocument();

      // Should show fallback circle with first letter
      const fallbackElement = iconContainer?.querySelector('div[style*="border-radius: 50%"]');
      expect(fallbackElement).toBeInTheDocument();
      expect(fallbackElement?.textContent).toBe('N'); // First letter of 'nonexistent-icon'
    });

    it('should handle empty icon string', () => {
      const habit = createMockHabit({ icon: '' });

      render(<HabitCard habit={habit} />);

      // Icon container should not be rendered when no icon is provided
      const iconContainer = document.querySelector('.habitIcon');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should handle undefined icon', () => {
      const habit = createMockHabit({ icon: undefined } as any);

      render(<HabitCard habit={habit} />);

      // Icon container should not be rendered when icon is undefined
      const iconContainer = document.querySelector('.habitIcon');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('icon styling and properties', () => {
    it('should apply habit color to icon', () => {
      const habit = createMockHabit({
        icon: 'heart',
        color: '#FF6B6B',
      });

      render(<HabitCard habit={habit} />);

      const iconElement = document.querySelector('.habitIcon div[style*="color"]');
      expect(iconElement).toHaveStyle({ color: '#FF6B6B' });
    });

    it('should set correct icon dimensions', () => {
      const habit = createMockHabit({ icon: 'water-drop' });

      render(<HabitCard habit={habit} />);

      const iconElement = document.querySelector('.habitIcon div[style*="width"]');
      expect(iconElement).toHaveStyle({
        width: '24px',
        height: '24px',
      });
    });

    it('should apply habit color to fallback icon', () => {
      const habit = createMockHabit({
        icon: 'missing-icon',
        color: '#9333EA',
      });

      render(<HabitCard habit={habit} />);

      const fallbackElement = document.querySelector('div[style*="background-color"]');
      expect(fallbackElement).toHaveStyle({ backgroundColor: '#9333EA' });
    });
  });

  describe('backward compatibility', () => {
    it('should handle icons that were previously hardcoded', () => {
      // Test icons that existed in the old hardcoded system
      const legacyIcons = ['heart', 'dumbbell', 'book', 'star', 'coffee', 'sun'];

      legacyIcons.forEach(iconId => {
        const habit = createMockHabit({ icon: iconId });

        const { unmount } = render(<HabitCard habit={habit} />);

        // These should all work with IconLibrary now
        const iconSvg = IconLibrary.getIconSvgById(iconId);
        expect(iconSvg).toBeTruthy();

        const iconContainer = document.querySelector('.habitIcon');
        expect(iconContainer).toBeInTheDocument();

        unmount();
      });
    });

    it('should work with new IconLibrary IDs that were causing the bug', () => {
      // Test the specific icon that was causing the original bug
      const habit = createMockHabit({ icon: 'water-drop' }); // Was 'water' in hardcoded system

      render(<HabitCard habit={habit} />);

      // This should now work correctly with IconLibrary
      const iconSvg = IconLibrary.getIconSvgById('water-drop');
      expect(iconSvg).toBeTruthy();

      const iconContainer = document.querySelector('.habitIcon');
      expect(iconContainer).toBeInTheDocument();

      // Should not show fallback since the icon exists
      const fallbackElement = document.querySelector('div[style*="border-radius: 50%"]');
      expect(fallbackElement).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should maintain accessibility properties from IconLibrary', () => {
      const habit = createMockHabit({ icon: 'heart' });

      render(<HabitCard habit={habit} />);

      const icon = IconLibrary.getIconById('heart');
      expect(icon?.accessibility?.ariaLabel).toBeTruthy();
      expect(icon?.accessibility?.description).toBeTruthy();
    });
  });
});
