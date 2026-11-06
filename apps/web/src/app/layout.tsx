import type { Metadata, Viewport } from 'next';
import { UserProvider } from '@/components/UserContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import '../index.css';

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://wayfarer.nahomw.tech'
  ),
  title: {
    default: 'Wayfarer — Addis Ababa City Guide',
    template: '%s · Wayfarer',
  },
  description:
    'Curated historical landmarks, lush parks, authentic Ethiopian coffee houses, honest community reviews, and concurrency-safe guided tour bookings in Addis Ababa, Ethiopia.',
  keywords: [
    'Addis Ababa',
    'Ethiopia',
    'City Guide',
    'Travel Guide',
    'National Museum of Ethiopia',
    'Entoto Park',
    'Tomoca Coffee',
    'Guided Tours',
    'Honest Reviews',
    'Wayfarer',
  ],
  authors: [{ name: 'Nahom WG', url: 'https://nahomw.tech' }],
  creator: 'Nahom WG',
  publisher: 'Rago Systems Wayfarer Assessment',
  applicationName: 'Wayfarer',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48 32x32 16x16' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Wayfarer — Addis Ababa City Guide',
    description:
      'Curated historical landmarks, lush parks, authentic Ethiopian coffee houses, honest reviews, and guided tours in Addis Ababa.',
    url: 'https://wayfarer.nahomw.tech',
    siteName: 'Wayfarer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Wayfarer — Addis Ababa City Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wayfarer — Addis Ababa City Guide',
    description:
      'Curated historical landmarks, lush parks, authentic coffee houses, honest reviews, and guided tours in Addis Ababa.',
    images: ['/og-image.jpg'],
    creator: '@nahomw',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0 }}>
        <UserProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
