'use client';

import { createContext, useContext, useState } from 'react';

const UI = createContext({});

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UI.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </UI.Provider>
  );
};

export const useUI = () => useContext(UI);
