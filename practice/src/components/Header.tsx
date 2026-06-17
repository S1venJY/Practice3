import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
      <h1>Персональна Галерея</h1>
      <button 
        onClick={toggleTheme} 
        style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px' }}
      >
        Режим: {theme === 'light' ? 'Світлий' : 'Темний'}
      </button>
    </header>
  );
};