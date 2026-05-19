import { twMerge } from 'tailwind-merge';

export default function Footer() {
  const appName = 'DEVBUG';
  const version = '0.1.0';
  return (
    <footer className="w-full text-center bg-neutral-800 text-zinc-50 p-5 text-sm mt-auto">
      <div className="flex flex-col gap-x-4 gap-y-2 justify-center font-semibold text-sm">
        <div>
          <ul className="flex flex-wrap gap-x-5 justify-center">
            <li className="relative after:absolute after:content-['|'] after:-right-2.5 after:text-slate-300">
              © {new Date().getFullYear()} {appName}
            </li>
            <li className="relative after:absolute after:content-['|'] after:-right-2.5 after:text-slate-300">
              <a
                href="hola"
                target="_blank"
                rel="nofollow"
                className="hover:text-white"
              >
                Legal advice
              </a>
            </li>
            <li className="relative after:absolute after:content-['|'] after:-right-2.5 after:text-neutral-300">
              <a
                href="hola"
                target="_blank"
                rel="nofollow"
                className="hover:text-white"
              >
                adios
              </a>
            </li>
            <li>v{version}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
