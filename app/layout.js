import './globals.css';

import { UIProvider } from '@/contexts/ui';
import { ThemeProvider } from '@/components/ThemeProvider';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import { METADATA } from '@/shared/metadata.js';

export const metadata = METADATA;

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
          <UIProvider>
            <div className="flex flex-col h-screen">
              <main className="grow">
                <div className="grid grid-cols-[275px_calc(100%-275px)] max-md:grid-cols-1 h-full">
                  <Sidebar />
                  <div>
                    <Header />

                    <div className="flex flex-col px-4 sm:px-5 pt-2 pb-5 w-full h-auto">
                      {children}
                    </div>
                  </div>
                </div>
              </main>

              <Footer />
            </div>
          </UIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
