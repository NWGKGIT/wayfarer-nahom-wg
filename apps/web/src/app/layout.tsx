import type { Metadata } from 'next';
import '../index.css';
export const metadata: Metadata = { title: 'Wayfarer | Addis Ababa', description: 'Discover places and tours in Addis Ababa.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
