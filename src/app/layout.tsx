import type { Metadata } from 'next';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tarifly.app'),
  applicationName: 'Tarifly',
  title: {
    default: 'Tarifly - Logiciel de calcul de prix, marge et devis pour professionnels',
    template: '%s | Tarifly',
  },
  description:
    'Tarifly aide les indépendants, artisans et prestataires à calculer un prix rentable, comparer leur tarif au marché, gérer leurs opportunités et générer des devis professionnels.',
  keywords: [
    'logiciel devis',
    'calculateur de prix',
    'calcul marge',
    'logiciel marge commerciale',
    'outil rentabilité',
    'devis professionnel',
    'logiciel artisan',
    'logiciel freelance',
    'calcul prix prestation',
    'comparaison marché',
    'gestion opportunités commerciales',
  ],
  authors: [{ name: 'Aurora Web & Security' }],
  creator: 'Aurora Web & Security',
  publisher: 'Aurora Web & Security',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Tarifly',
    title: 'Tarifly - Calculateur de prix rentable et logiciel de devis',
    description:
      'Calculez vos prix, protégez votre marge, comparez votre tarif au marché et générez des devis professionnels depuis un dashboard SaaS.',
    images: [
      {
        url: '/home-target.png',
        width: 1680,
        height: 945,
        alt: 'Tarifly - logiciel de calcul de prix et devis professionnels',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifly - Logiciel de calcul de prix, marge et devis',
    description:
      'Un SaaS pour calculer un prix rentable, suivre ses opportunités et générer des devis professionnels.',
    images: ['/home-target.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        <ToastProvider />
        <CookieConsentBanner />
      </body>
    </html>
  );
}

