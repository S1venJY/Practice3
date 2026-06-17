import React, { createContext, useState, useEffect, useContext } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-gallery-theme');
    return (saved as ThemeMode) || 'light';
  });

  useEffect(() => {
    const rootElement = window.document.documentElement;
    rootElement.classList.remove('light', 'dark');
    rootElement.classList.add(theme);
    localStorage.setItem('app-gallery-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme повинен використовуватись всередині ThemeProvider');
  }
  return context;
};