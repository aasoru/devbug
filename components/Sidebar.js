'use client';

import { twMerge } from 'tailwind-merge';

import { useUI } from '@/contexts/ui';

import BugIcon from '@/public/images/icons/bug.svg';
import Link from 'next/link';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUI();

  return (
    <>
      <div
        onClick={() => setSidebarOpen(false)}
        className={twMerge(
          'fixed inset-0 bg-black/50 z-10 opacity-0 transition md:hidden',
          sidebarOpen && 'opacity-100',
          !sidebarOpen && 'pointer-events-none'
        )}
      />
      <aside
        className={twMerge(
          'h-full bg-[#373737] text-sm divide-y divide-neutral-600 max-md:transition',
          'max-md:fixed max-md:z-10 max-md:inset-0 max-md:w-5/6 max-md:max-w-xs max-md:overflow-y-scroll',
          !sidebarOpen && 'max-md:-translate-x-full',
          sidebarOpen &&
            'max-md:translate-x-0 max-md:shadow-[0px_0px_20px_0px] max-md:shadow-black'
        )}
      >
        <Link href="/" onClick={() => setSidebarOpen(false)}>
          <div className="flex text-neutral-300 text-center p-4 items-center justify-center text-2xl">
            {'{'}
            <BugIcon />
            {'}'} DEVBUG
          </div>
        </Link>
        <ul className="divide-y divide-neutral-600 font-bold">
          <MenuItem href="/chronometer">
            <div className="flex items-center gap-3">
              <span>Chronometer</span>
            </div>
          </MenuItem>
          <MenuItem href="/text-analizer">
            <div className="flex items-center gap-3">
              <span>Text Analizer</span>
            </div>
          </MenuItem>
          <MenuItem href="/chmod-generator">
            <div className="flex items-center gap-3">
              <span>CHMOD Generator</span>
            </div>
          </MenuItem>
          <MenuItem href="/json-minifier">
            <div className="flex items-center gap-3">
              <span>Json Minifier</span>
            </div>
          </MenuItem>
          <MenuItem href="/jwt-decoder">
            <div className="flex items-center gap-3">
              <span>JWT Decoder</span>
            </div>
          </MenuItem>
          <MenuItem href="/base64">
            <div className="flex items-center gap-3">
              <span>Base64</span>
            </div>
          </MenuItem>
          <MenuItem href="/mosaic">
            <div className="flex items-center gap-3">
              <span>Mosaic</span>
            </div>
          </MenuItem>
        </ul>
      </aside>
    </>
  );
};

const MenuItem = ({ href, children }) => {
  const { setSidebarOpen } = useUI();
  return (
    <li>
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className="flex items-center py-2 text-neutral-300 bg-neutral-700 pr-5 pl-7 hover:bg-neutral-600"
      >
        <div className="grow">{children}</div>
      </Link>
    </li>
  );
};

export default Sidebar;
