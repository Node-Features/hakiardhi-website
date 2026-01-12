import type { Metadata } from 'next';
import './globals.css';
import SkipLink from '@/components/ui/SkipLink';

export const metadata: Metadata = {
  title: 'HakiArdhi - Land Rights Research & Resources Institute',
  description: 'Empowering communities to claim and protect their land and natural resource rights. Research, training, and advocacy for land rights in Tanzania since 1994.',
  keywords: ['land rights', 'Tanzania', 'community empowerment', 'legal aid', 'land advocacy', 'LARRRI', 'HakiArdhi'],
  authors: [{ name: 'HakiArdhi Institute' }],
  openGraph: {
    title: 'HakiArdhi - Land Rights Research & Resources Institute',
    description: 'Securing Land Rights for All',
    type: 'website',
    locale: 'en_TZ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
