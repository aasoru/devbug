import Link from 'next/link';
import { Binary, Braces, FileLock, KeyRound, TextSearch, Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';

const tools = [
  {
    href: '/chronometer',
    icon: Timer,
    title: 'Chronometer',
    description: 'Stopwatch with lap tracking.',
  },
  {
    href: '/text-analizer',
    icon: TextSearch,
    title: 'Text Analyzer',
    description: 'Character, word and line counts with pattern matching.',
  },
  {
    href: '/chmod-generator',
    icon: FileLock,
    title: 'CHMOD Generator',
    description: 'Calculate Unix file permissions in numeric and symbolic format.',
  },
  {
    href: '/json-minifier',
    icon: Braces,
    title: 'JSON Minifier',
    description: 'Minify or prettify JSON with size comparison.',
  },
  {
    href: '/jwt-decoder',
    icon: KeyRound,
    title: 'JWT Decoder',
    description: 'Inspect JWT header, payload and expiry without a secret key.',
  },
  {
    href: '/base64',
    icon: Binary,
    title: 'Base64',
    description: 'Encode and decode Base64 with full UTF-8 support.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">devbug</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          A collection of small, self-contained tools for day-to-day development work. No accounts, no cookies, no backend — everything runs in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="max-w-none h-full py-5 px-6 hover:bg-muted/30 transition-colors cursor-pointer flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                <tool.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">{tool.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
