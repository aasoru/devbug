'use client';

import { createContext, useContext, useState } from 'react';

const UI = createContext({});

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  return (
    <UI.Provider value={{ sidebarOpen, setSidebarOpen, theme, setTheme }}>
      {children}
    </UI.Provider>
  );
};

export const useUI = () => useContext(UI);
