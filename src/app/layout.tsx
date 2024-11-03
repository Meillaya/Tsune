import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { HistoryProvider } from "@/context/HistoryContext";
import { ListsProvider } from '@/context/ListsContext';
import { MainContent } from '@/components/main-content';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient()
import QueryProvider from '@/components/providers/query-provider'

export const metadata: Metadata = {
  title: 'AniStream - Anime Streaming Platform',
  description: 'Watch your favorite anime shows and movies',
};

export const revalidate = 3600 // Revalidate every hour

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
                <QueryProvider>
                  <MainContent>
                    {children}
                  </MainContent>
                </QueryProvider>
              </div>
            </ThemeProvider>
          </HistoryProvider>
        </ListsProvider>
      </body>
    </html>
  );
}
