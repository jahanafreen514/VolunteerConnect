import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check saved preference
    const saved = localStorage.getItem('vc_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to light for soft pastel aesthetic, or match system
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('vc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Reusable animated Theme Toggle Button
 */
export const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2 rounded-xl text-sm',
    lg: 'p-2.5 rounded-2xl text-base'
  }[size] || 'p-2 rounded-xl text-sm';

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5'
  }[size] || 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Soft Pastel Light Mode' : 'Switch to Soft Velvet Dark Mode'}
      className={`relative inline-flex items-center justify-center transition-all duration-300
        bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-300/70 shadow-sm
        dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-slate-200 dark:border-white/15 dark:shadow-glass
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400/40 ${sizeClasses} ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className={`${iconSizes} text-amber-300 rotate-0 transition-transform duration-300 hover:rotate-45`} />
        ) : (
          <Moon className={`${iconSizes} text-primary-600 -rotate-12 transition-transform duration-300 hover:rotate-0`} />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeContext;
