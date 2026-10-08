import './globals.css';

import { UIProvider } from '@/contexts/ui';
import { ThemeProvider } from '@/components/ThemeProvider';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { RouteTransition } from '@/components/RouteTransition';
import { ServiceWorker } from '@/components/ServiceWorker';

import { METADATA } from '@/shared/metadata.js';

export const metadata = METADATA;

// The browser / system bar colour: the page background of each theme (follows the system's
// theme; the in-page toggle can't reach the system bar before the page loads).
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020817' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorker />
          <UIProvider>
            {/* The first stop for keyboard users: past the menu, straight to the tool. Off screen
                until it gets focus. */}
            <a
              href="#content"
              className="fixed left-4 top-4 z-50 -translate-y-20 rounded-md bg-background px-4 py-2 text-sm font-medium shadow-md ring-2 ring-ring transition-transform focus:translate-y-0"
            >
              Skip to content
            </a>
            <div className="flex flex-col h-screen">
              <div className="grow">
                <div className="grid grid-cols-[275px_calc(100%-275px)] max-md:grid-cols-1 h-full">
                  <Sidebar />
                  <div>
                    <Header />

                    {/* Only the page's content is <main> (the landmark screen readers jump to). */}
                    <main id="content" tabIndex={-1} className="flex flex-col px-4 sm:px-5 pt-2 pb-5 w-full h-auto outline-hidden">
                      <RouteTransition>{children}</RouteTransition>
                    </main>
                  </div>
                </div>
              </div>

              <Footer />
            </div>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
