import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/QueryProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'KURDAMUZ - Learn Kurdish with Precision',
  description:
    'A modern learning platform combining structured progression, intelligent practice systems, and rewarding educational mechanics for learning Kurdish.',
  keywords: [
    'Kurdish',
    'Language Learning',
    'Education',
    'KURDAMUZ',
    'Learn Kurdish',
    'Language Platform',
  ],
  authors: [{ name: 'KURDAMUZ Team' }],
  creator: 'KURDAMUZ',
  publisher: 'KURDAMUZ',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kurdamuz.dev',
    title: 'KURDAMUZ - Learn Kurdish with Precision',
    description:
      'A modern learning platform combining structured progression, intelligent practice systems, and rewarding educational mechanics for learning Kurdish.',
    siteName: 'KURDAMUZ',
    images: [
      {
        url: 'https://kurdamuz.dev/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KURDAMUZ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KURDAMUZ - Learn Kurdish with Precision',
    description:
      'A modern learning platform combining structured progression, intelligent practice systems, and rewarding educational mechanics for learning Kurdish.',
    images: ['https://kurdamuz.dev/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KURDAMUZ',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a1628',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KURDAMUZ" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
