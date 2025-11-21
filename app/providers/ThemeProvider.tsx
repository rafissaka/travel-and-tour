'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize from localStorage during SSR/initial render
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        return savedTheme;
      }
    }
    return 'system';
  });
  const [mounted, setMounted] = useState(false);

  // Calculate resolved theme without setState
  const resolvedTheme = useMemo(() => getResolvedTheme(theme), [theme]);

  // Mark as mounted and sync with DOM
  useEffect(() => {
    setMounted(true);

    // Sync state with what's already applied in DOM from script tag
    const root = document.documentElement;
    const hasDarkClass = root.classList.contains('dark');
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    console.log('ThemeProvider mounted:', { savedTheme, hasDarkClass, currentTheme: theme });

    // If there's a mismatch, fix it
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const applied = getResolvedTheme(theme);

    if (applied === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);

    console.log('Theme changed:', { theme, applied, classList: root.classList.toString() });
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const applied = getResolvedTheme('system');
        const root = document.documentElement;
        if (applied === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        console.log('System theme changed:', applied);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
