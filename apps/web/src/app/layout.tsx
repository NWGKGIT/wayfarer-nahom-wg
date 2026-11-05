import type { Metadata } from 'next';
import { UserProvider } from '@/components/UserContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import '../index.css';

export const metadata: Metadata = {
  title: 'Wayfarer | Addis Ababa City Guide',
  description: 'Honest reviews and concurrency-safe guided tour bookings in Addis Ababa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 antialiased font-sans selection:bg-blue-600 selection:text-white">
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
