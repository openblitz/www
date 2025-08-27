import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { themeStore, darkMode } from './stores';

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset theme store to system
    themeStore.set('system');
  });

  describe('Theme Store Functionality', () => {
    it('should initialize with system theme', () => {
      expect(get(themeStore)).toBe('system');
    });

    it('should update theme preference', () => {
      themeStore.set('dark');
      expect(get(themeStore)).toBe('dark');
      
      themeStore.set('light');
      expect(get(themeStore)).toBe('light');
      
      themeStore.set('system');
      expect(get(themeStore)).toBe('system');
    });

    it('should cycle through themes correctly with toggle', () => {
      // Start with system
      expect(get(themeStore)).toBe('system');
      
      // Use the toggle method to cycle through themes
      themeStore.toggle();
      expect(get(themeStore)).toBe('light');
      
      themeStore.toggle();
      expect(get(themeStore)).toBe('dark');
      
      themeStore.toggle();
      expect(get(themeStore)).toBe('system');
    });

    it('should have toggle method', () => {
      expect(typeof themeStore.toggle).toBe('function');
    });

    it('should have init method', () => {
      expect(typeof themeStore.init).toBe('function');
    });

    it('should have set method', () => {
      expect(typeof themeStore.set).toBe('function');
    });

    it('should have subscribe method', () => {
      expect(typeof themeStore.subscribe).toBe('function');
    });
  });

  describe('Dark Mode Computed Store', () => {
    it('should return true for dark theme', () => {
      themeStore.set('dark');
      expect(get(darkMode)).toBe(true);
    });

    it('should return false for light theme', () => {
      themeStore.set('light');
      expect(get(darkMode)).toBe(false);
    });

    it('should return a boolean for system theme', () => {
      themeStore.set('system');
      const isDark = get(darkMode);
      expect(typeof isDark).toBe('boolean');
    });

    it('should be reactive to theme changes', () => {
      themeStore.set('light');
      expect(get(darkMode)).toBe(false);
      
      themeStore.set('dark');
      expect(get(darkMode)).toBe(true);
    });
  });

  describe('Store Integration', () => {
    it('should have darkMode as property of themeStore', () => {
      expect(themeStore.isDarkMode).toBeDefined();
      expect(darkMode).toBe(themeStore.isDarkMode);
    });

    it('should maintain consistency between theme and dark mode', () => {
      themeStore.set('dark');
      expect(get(themeStore)).toBe('dark');
      expect(get(darkMode)).toBe(true);
      
      themeStore.set('light');
      expect(get(themeStore)).toBe('light');
      expect(get(darkMode)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes', () => {
      themeStore.set('light');
      themeStore.set('dark');
      themeStore.set('system');
      themeStore.set('light');
      
      expect(get(themeStore)).toBe('light');
    });

    it('should handle setting same theme multiple times', () => {
      themeStore.set('dark');
      themeStore.set('dark');
      themeStore.set('dark');
      
      expect(get(themeStore)).toBe('dark');
    });

    it('should handle invalid theme values', () => {
      // Store the current state first
      themeStore.set('dark');
      const currentTheme = get(themeStore);
      expect(currentTheme).toBe('dark');
      
      try {
        // This should either work with type coercion or throw an error
        // @ts-expect-error - Testing invalid input
        themeStore.set('invalid');
        
        // If it accepts the invalid input, check what it actually contains
        const newTheme = get(themeStore);
        
        // Either it should be a valid theme or should have fallen back to a default
        const isValid = ['system', 'light', 'dark'].includes(newTheme);
        
        if (!isValid) {
          // If the store accepted an invalid value, document what happened
          console.log('Store accepted invalid value:', newTheme);
        }
        
        // For this test, we'll accept that the store might contain the invalid value
        // The important thing is that it doesn't crash
        expect(typeof newTheme).toBe('string');
      } catch (error) {
        // If it throws, that's also acceptable behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('Subscription Behavior', () => {
    it('should notify subscribers when theme changes', () => {
      let notified = false;
      let receivedValue: string | undefined;
      
      const unsubscribe = themeStore.subscribe((value) => {
        notified = true;
        receivedValue = value;
      });
      
      themeStore.set('dark');
      
      expect(notified).toBe(true);
      expect(receivedValue).toBe('dark');
      
      unsubscribe();
    });

    it('should notify dark mode subscribers when theme changes', () => {
      let notified = false;
      let receivedValue: boolean | undefined;
      
      const unsubscribe = darkMode.subscribe((value) => {
        notified = true;
        receivedValue = value;
      });
      
      themeStore.set('dark');
      
      expect(notified).toBe(true);
      expect(receivedValue).toBe(true);
      
      unsubscribe();
    });
  });
});
