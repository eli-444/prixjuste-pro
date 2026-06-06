import type { MetadataRoute } from 'next';

const baseUrl = 'https://tarifly.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/dashboard/',
        '/devis/',
        '/modifier-mot-de-passe',
        '/mon-compte',
        '/opportunites/',
        '/success',
        '/cancel',
        '/connexion',
        '/mot-de-passe-oublie',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
