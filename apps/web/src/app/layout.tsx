import type { Metadata } from 'next';
import { UserProvider } from '@/components/UserContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import '../index.css';

export const metadata: Metadata = {
  title: 'Wayfarer · Addis Ababa City Guide',
  description: 'Honest reviews and concurrency-safe guided tour bookings in Addis Ababa.',
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
