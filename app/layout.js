//import { Inter } from 'next/font/google'
import './globals.css';

import { UIProvider } from '@/contexts/ui';
import { ThemeProvider } from '@/components/ThemeProvider';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

//const inter = Inter({ subsets: ['latin'] });
import { METADATA } from '@/shared/metadata.js';

export const metadata = METADATA;

export default function RootLayout({ children }) {
  return (
    <html lang="en" /* data-theme="dark" */>
      <body /* className={inter.className} */>
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

                    <div className="flex flex-col p-5 w-full h-auto">
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
