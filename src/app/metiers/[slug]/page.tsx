import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoContentPage } from '@/components/SeoContentPage';
import { baseUrl, getProfessionSeoPage, professionSeoPages } from '@/lib/seo-pages';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return professionSeoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getProfessionSeoPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: `/metiers/${page.slug}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: `${baseUrl}/metiers/${page.slug}`,
      type: 'article',
    },
  };
}

export default async function ProfessionPage({ params }: Props) {
  const { slug } = await params;
  const page = getProfessionSeoPage(slug);

  if (!page) {
    notFound();
  }

  return <SeoContentPage page={page} type="profession" />;
}
