import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/provider/provider';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
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
    <html
      lang="vi"
      className={cn(
        'h-full antialiased',
        geistSans.variable,
        geistMono.variable,
        geistSans.className,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
