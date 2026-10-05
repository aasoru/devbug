'use client';

import { useUI } from '@/contexts/ui';
import ThemeToggle from '@/components/ThemeToggle';

import MenuIcon from '@/public/images/icons/menu.svg';

export default function Header() {
  const { sidebarOpen, setSidebarOpen } = useUI();

  return (
    <header className="flex items-center justify-center mb-auto p-4">
      <div className="flex gap-4 items-center">
        <button
          type="button"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          className="text-foreground md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="grow" />
      <div className="flex gap-2 font-bold items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}
