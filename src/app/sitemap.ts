import type { MetadataRoute } from 'next';
import { intentSeoPages, professionSeoPages } from '@/lib/seo-pages';

const baseUrl = 'https://tarifly.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date();

  const staticPages: MetadataRoute.Sitemap = [
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
      url: `${baseUrl}/ressources`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/metiers`,
      lastModified: updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/conditions`,
      lastModified: updatedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/aide`,
      lastModified: updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
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

  const resourcePages: MetadataRoute.Sitemap = intentSeoPages.map((page) => ({
    url: `${baseUrl}/ressources/${page.slug}`,
    lastModified: updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const professionPages: MetadataRoute.Sitemap = professionSeoPages.map((page) => ({
    url: `${baseUrl}/metiers/${page.slug}`,
    lastModified: updatedAt,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...staticPages, ...resourcePages, ...professionPages];
}
