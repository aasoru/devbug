'use client';

import { useUI } from '@/contexts/ui';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const { setSidebarOpen } = useUI();

  return (
    <header className="flex items-center justify-center mb-auto p-4">
      <div className="flex gap-4 items-center">
        <button
          title="Toggle sidebar"
          className="text-foreground md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="grow" />
      <div className="flex gap-2 font-bold items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
