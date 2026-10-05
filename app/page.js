import Link from 'next/link';
import { Binary, Braces, FileLock, KeyRound, LayoutDashboard, TextSearch, Timer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TOOLS } from '@/shared/tools';

// What each card adds to the tool's name. Kept on this server page, not in shared/tools.js,
// so the icons and descriptions cost the browser nothing.
const CARDS = {
  '/chronometer': { icon: Timer, description: 'Stopwatch with lap tracking.' },
  '/text-analizer': { icon: TextSearch, description: 'Character, word and line counts with pattern matching.' },
  '/chmod-generator': { icon: FileLock, description: 'Calculate Unix file permissions in numeric and symbolic format.' },
  '/json-minifier': { icon: Braces, description: 'Minify or prettify JSON with size comparison.' },
  '/jwt-decoder': { icon: KeyRound, description: 'Inspect JWT header, payload and expiry without a secret key.' },
  '/base64': { icon: Binary, description: 'Encode and decode Base64 with full UTF-8 support.' },
  '/mosaic': { icon: LayoutDashboard, description: 'Fit images of any size into a frame without cropping, with the least empty space.' },
};

const ToolCard = ({ tool, card: { icon: Icon, description } }) => (
  <Link href={tool.href}>
    <Card className="max-w-none h-full py-5 px-6 hover:bg-muted/30 transition-colors cursor-pointer flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold">{tool.name}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </Card>
  </Link>
);

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">devbug</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          A collection of small, self-contained tools for developers and everyday tasks. No accounts, no tracking, no backend — everything runs in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => <ToolCard key={tool.href} tool={tool} card={CARDS[tool.href]} />)}
      </div>
    </div>
  );
}
