import { name, version } from '@/package.json';

export default function Footer() {
  const appName = name.toUpperCase();
  return (
    <footer className="w-full text-center bg-neutral-800 text-zinc-50 p-5 text-sm mt-auto">
      <div className="flex flex-col gap-x-4 gap-y-2 justify-center font-semibold text-sm">
        <div>
          <ul className="flex flex-wrap gap-x-5 justify-center">
            <li className="relative after:absolute after:content-['|'] after:-right-2.5 after:text-slate-300">
              © {new Date().getFullYear()} {appName}
            </li>
            <li>v{version}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
