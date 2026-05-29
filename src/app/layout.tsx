import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tarifly - Calculez un prix rentable pour vos prestations',
  description:
    'Un calculateur professionnel pour fixer un tarif rentable, intégrer vos coûts et présenter un prix clair à vos clients.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
