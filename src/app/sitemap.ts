import type { MetadataRoute } from 'next';

const baseUrl = 'https://tarifly.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date();

  return [
    {
      url: baseUrl,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/outil`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/conditions`,
      lastModified: updatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: updatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: updatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
