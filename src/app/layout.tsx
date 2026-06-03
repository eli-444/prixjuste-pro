import type { Metadata } from 'next';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tarifly - Calculez un prix rentable pour vos prestations',
  description:
    'Un calculateur professionnel pour fixer un tarif rentable, integrer vos couts et presenter un prix clair a vos clients.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
