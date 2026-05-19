'use client';

import { twMerge } from 'tailwind-merge';

import { useUI } from '@/contexts/ui';

import BugIcon from '@/public/images/icons/bug.svg';
import Link from 'next/link';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useUI();

  const active = false;

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
        <Link href="/">
          <div className="flex text-neutral-300 text-center p-4 items-center justify-center text-2xl">
            {'{'}
            <BugIcon />
            {'}'} DEVBUG
          </div>
        </Link>
        <ul className="divide-y divide-neutral-600 font-bold">
          <MenuItem href="/chronometer" active>
            <div className="flex items-center gap-3">
              <span>Chronometer</span>
            </div>
          </MenuItem>
          <MenuItem href="/text-analizer" active>
            <div className="flex items-center gap-3">
              <span>Text Analizer</span>
            </div>
          </MenuItem>
          <MenuItem href="/chmod-generator" active>
            <div className="flex items-center gap-3">
              <span>CHMOD Generator</span>
            </div>
          </MenuItem>
          <MenuItem href="/json-minifier" active>
            <div className="flex items-center gap-3">
              <span>Json Minifier</span>
            </div>
          </MenuItem>
        </ul>
        {/*         <GroupSection title="Administración">
          {administrationList.map((item, index) => {
            return (
              <MenuItem key={index} href={item.href} active hasChilren>
                {item.title}
              </MenuItem>
            );
          })}
        </GroupSection> */}
        {/* <ul className="divide-y divide-neutral-600 font-bold">
          <MenuItem href="/panel/stats" active>
            <div className="flex items-center gap-3">
              <span>Estadísticas</span>
            </div>
          </MenuItem>
        </ul>
        <ul className="divide-y divide-neutral-600 font-bold">
          <MenuItem href="/panel/news" active>
            <div className="flex items-center gap-3">
              <span>Noticias</span>
            </div>
          </MenuItem>
        </ul>
        <ul className="divide-y divide-neutral-600 font-bold">
          <MenuItem href="/panel/support" active>
            <div className="flex items-center gap-3">
              <span>Soporte</span>
            </div>
          </MenuItem>
        </ul> */}
      </aside>
    </>
  );
};

const GroupSection = ({ title, children, ...props }) => {
  return (
    <details
      {...props}
      className="divide-y divide-neutral-600 [&>summary>svg]:open:rotate-90 [&>summary>svg]:rotate-0"
    >
      <GroupSectionTitle>
        <div className="flex items-center gap-3">
          <span>{title}</span>
        </div>
      </GroupSectionTitle>
      <ul className="divide-y divide-neutral-600">{children}</ul>
    </details>
  );
};

const GroupSectionTitle = ({ children }) => {
  return (
    <summary className="py-2 text-neutral-300 bg-neutral-800 font-bold pr-5 pl-7 list-none cursor-pointer flex items-center justify-between">
      <span>{children}</span>
    </summary>
  );
};

const MenuItem = ({
  href,
  children,
  onClick,
  className,
  active,
  hasChilren = false,
}) => {
  //const { asPath } = useRouter();
  return (
    <li>
      <a
        href={href}
        className={twMerge(
          'flex items-center py-2 text-neutral-300 bg-neutral-700 pr-5 pl-7 hover:bg-neutral-600'
          //asPath === href && 'bg-neutral-600'
        )}
      >
        <div className="grow">{children}</div>
      </a>
    </li>
  );
};

export default Sidebar;
