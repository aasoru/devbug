'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

import { useUI } from '@/contexts/ui';
import { useDismiss } from '@/hooks/useDismiss';
import { TOOLS } from '@/shared/tools';

import BugIcon from '@/public/images/icons/bug.svg';

// The menu: fixed on the left from md up; on phones, a drawer the header's button opens.
// The overlay closes it on a tap (and takes that tap, so it doesn't reach the page below);
// Esc closes it too. The current section is marked (aria-current, and visibly).
const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUI();
  const pathname = usePathname();
  const close = () => setSidebarOpen(false);

  useDismiss(null, sidebarOpen, close);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={close}
        className={twMerge(
          'fixed inset-0 bg-black/50 z-10 opacity-0 transition md:hidden',
          sidebarOpen && 'opacity-100',
          !sidebarOpen && 'pointer-events-none'
        )}
      />
      <aside
        id="sidebar"
        className={twMerge(
          'h-full bg-sidebar text-sm divide-y divide-neutral-600 max-md:transition',
          'max-md:fixed max-md:z-10 max-md:inset-0 max-md:w-5/6 max-md:max-w-xs max-md:overflow-y-scroll',
          !sidebarOpen && 'max-md:-translate-x-full',
          sidebarOpen &&
            'max-md:translate-x-0 max-md:shadow-[0px_0px_20px_0px] max-md:shadow-black'
        )}
      >
        <Link href="/" onClick={close}>
          <div className="flex text-neutral-300 text-center p-4 items-center justify-center text-2xl">
            {'{'}
            <BugIcon />
            {'}'} DEVBUG
          </div>
        </Link>
        <ul className="divide-y divide-neutral-600 font-bold">
          {TOOLS.map((tool) => (
            <MenuItem key={tool.href} href={tool.href} current={pathname === tool.href} onNavigate={close}>
              {tool.name}
            </MenuItem>
          ))}
        </ul>
      </aside>
    </>
  );
};

// The current entry: lighter, with a bar on its left edge (the padding shrinks by the bar's
// width so the text doesn't move).
const MenuItem = ({ href, current, onNavigate, children }) => (
  <li>
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? 'page' : undefined}
      className={twMerge(
        'flex items-center py-2 text-neutral-300 bg-neutral-700 pr-5 pl-7 hover:bg-neutral-600',
        current && 'border-l-4 border-neutral-100 bg-neutral-600 pl-6 text-white'
      )}
    >
      {children}
    </Link>
  </li>
);

export default Sidebar;
