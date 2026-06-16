import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import './globals.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { DefaultLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'FieldOps ERP',
  description: 'Operations dashboard for sports field booking management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <MantineProvider defaultColorScheme="auto">
          <DefaultLayout>{children}</DefaultLayout>
        </MantineProvider>
      </body>
    </html>
  );
}
