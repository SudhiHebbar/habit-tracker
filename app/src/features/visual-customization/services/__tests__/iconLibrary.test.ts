import { IconLibrary } from '../iconLibrary';

describe('IconLibrary', () => {
  describe('getIconById', () => {
    it('should return icon object for valid ID', () => {
      const icon = IconLibrary.getIconById('water-drop');

      expect(icon).toBeDefined();
      expect(icon?.id).toBe('water-drop');
      expect(icon?.name).toBe('Water Drop');
      expect(icon?.svg).toContain('<svg');
      expect(icon?.category).toBe('health');
    });

    it('should return undefined for invalid ID', () => {
      const icon = IconLibrary.getIconById('nonexistent-icon');

      expect(icon).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const icon = IconLibrary.getIconById('');

      expect(icon).toBeUndefined();
    });
  });

  describe('getIconSvgById', () => {
    it('should return SVG string for valid ID', () => {
      const svg = IconLibrary.getIconSvgById('water-drop');

      expect(svg).toBeDefined();
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox');
      expect(svg).toContain('</svg>');
    });

    it('should return null for invalid ID', () => {
      const svg = IconLibrary.getIconSvgById('nonexistent-icon');

      expect(svg).toBeNull();
    });

    it('should return null for empty string', () => {
      const svg = IconLibrary.getIconSvgById('');

      expect(svg).toBeNull();
    });

    it('should work with common icon IDs from the library', () => {
      const commonIcons = ['heart', 'water-drop', 'dumbbell', 'book', 'running', 'star'];

      commonIcons.forEach(iconId => {
        const svg = IconLibrary.getIconSvgById(iconId);
        expect(svg).toBeDefined();
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
      });
    });
  });

  describe('icon system compatibility', () => {
    it('should handle legacy icon IDs that were hardcoded', () => {
      // Test that the library contains icons that match what was previously hardcoded
      const iconMapping = {
        heart: 'heart', // This should match
        'water-drop': 'water-drop', // New correct ID
        dumbbell: 'dumbbell', // This should match
        book: 'book', // This should match
        running: 'running', // This should match
        star: 'star', // This should match
        coffee: 'coffee', // This should match
        sun: 'sun', // This should match
      };

      Object.entries(iconMapping).forEach(([iconId]) => {
        const icon = IconLibrary.getIconById(iconId);
        expect(icon).toBeDefined();
        expect(icon?.id).toBe(iconId);
      });
    });

    it('should provide fallback behavior for missing icons', () => {
      const missingIcon = IconLibrary.getIconSvgById('missing-icon');
      expect(missingIcon).toBeNull();
    });

    it('should have consistent SVG structure across all icons', () => {
      const allIcons = IconLibrary.getAllIcons();

      allIcons.forEach(icon => {
        expect(icon.svg).toContain('<svg');
        expect(icon.svg).toContain('viewBox');
        expect(icon.svg).toContain('</svg>');
        expect(icon.id).toBeTruthy();
        expect(icon.name).toBeTruthy();
        expect(icon.category).toBeTruthy();
      });
    });
  });

  describe('getAllIcons', () => {
    it('should return array of all available icons', () => {
      const icons = IconLibrary.getAllIcons();

      expect(Array.isArray(icons)).toBe(true);
      expect(icons.length).toBeGreaterThan(0);
      expect(icons[0]).toHaveProperty('id');
      expect(icons[0]).toHaveProperty('name');
      expect(icons[0]).toHaveProperty('svg');
      expect(icons[0]).toHaveProperty('category');
    });
  });

  describe('searchIcons', () => {
    it('should find icons by name', () => {
      const results = IconLibrary.searchIcons('water');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(icon => icon.id === 'water-drop')).toBe(true);
    });

    it('should find icons by category', () => {
      const results = IconLibrary.getIconsByCategory('health');

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(icon => icon.category === 'health')).toBe(true);
    });

    it('should return empty array for non-matching search', () => {
      const results = IconLibrary.searchIcons('nonexistent');

      expect(results).toEqual([]);
    });
  });
});
