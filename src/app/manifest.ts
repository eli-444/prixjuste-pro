import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tarifly - Logiciel de calcul de prix et devis',
    short_name: 'Tarifly',
    description:
      'Calculez un prix rentable, comparez votre tarif au marché, suivez vos opportunités et générez des devis professionnels.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0878f2',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  };
}
