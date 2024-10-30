import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { HistoryProvider } from "@/context/HistoryContext";
import { ListsProvider, useLists } from '@/context/ListsContext';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AniStream - Anime Streaming Platform',
  description: 'Watch your favorite anime shows and movies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
    <ListsProvider>
      <HistoryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
        </HistoryProvider>
        </ListsProvider>
      </body>
    </html>
  );
}