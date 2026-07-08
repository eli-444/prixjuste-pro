import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoContentPage } from '@/components/SeoContentPage';
import { baseUrl, getIntentSeoPage, intentSeoPages } from '@/lib/seo-pages';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return intentSeoPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getIntentSeoPage(slug);

  if (!page) {
    return {};
  }

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: `/ressources/${page.slug}`,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: `${baseUrl}/ressources/${page.slug}`,
      type: 'article',
    },
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const page = getIntentSeoPage(slug);

  if (!page) {
    notFound();
  }

  return <SeoContentPage page={page} type="resource" />;
}
