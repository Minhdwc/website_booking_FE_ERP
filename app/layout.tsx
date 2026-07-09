import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/provider/provider';
import { Roboto } from 'next/font/google';
import { cn } from '@/lib/utils';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Minh Đức Booking Sport',
  description: 'Operations dashboard for sports field booking management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn('h-full antialiased', roboto.className)} suppressHydrationWarning>
      <body className="min-h-full bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
