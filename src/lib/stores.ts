import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const inited = writable(false);
export const worker = writable<InstanceType<typeof ComlinkWorker> | null>(null);

export type ThemePreference = 'light' | 'dark' | 'system';

function getCookie(name: string): string | null {
  if (!browser) return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string) {
  if (!browser) return;
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
}

function createThemeStore() {
  const { subscribe, set, update } = writable<ThemePreference>('system');
  const isDarkMode = writable(false);

  let mediaQuery: MediaQueryList | undefined;

  function updateDarkMode(preference: ThemePreference) {
    if (preference === 'system') {
      function updateSystemTheme() {
        if (browser && mediaQuery) {
          isDarkMode.set(mediaQuery.matches);
          applyThemeClass(mediaQuery.matches ? 'dark' : 'light');
        }
      }
      if (!mediaQuery && browser) {
        mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', updateSystemTheme);
      }
      updateSystemTheme();
    } else {
      isDarkMode.set(preference === 'dark');
    }
  }

  function applyThemeClass(preference: ThemePreference) {
    if (!browser) return;
    
    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark');
    
    // Add specific class only for light/dark, leave unset for system
    if (preference === 'light') {
      document.documentElement.classList.add('light');
    } else if (preference === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // For 'system', add dark class based on media query preference
      document.documentElement.classList.add(mediaQuery?.matches ? 'dark' : 'light');
    }
  }

  return {
    subscribe,
    isDarkMode: { subscribe: isDarkMode.subscribe },
    set: (preference: ThemePreference) => {
      set(preference);
      updateDarkMode(preference);
      applyThemeClass(preference);
      setCookie('theme', preference);
    },
    toggle: () => {
      update(current => {
        let newPreference: ThemePreference;
        if (current === 'system') {
          newPreference = 'light';
        } else if (current === 'light') {
          newPreference = 'dark';
        } else {
          newPreference = 'system';
        }
        
        updateDarkMode(newPreference);
        applyThemeClass(newPreference);
        setCookie('theme', newPreference);
        
        return newPreference;
      });
    },
    // Initialize from cookie or default to system
    init: () => {
      if (browser) {
        const stored = getCookie('theme') as ThemePreference | null;
        const preference = stored || 'system';
        
        set(preference);
        updateDarkMode(preference);
        applyThemeClass(preference);
      }
    }
  };
}

export const themeStore = createThemeStore();

// Backward compatibility - simple dark mode boolean store
export const darkMode = themeStore.isDarkMode;
