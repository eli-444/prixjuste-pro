import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculateur de prix - Tarifly',
  description: 'Calculez un prix recommandé à partir de vos coûts, de votre temps et de votre marge cible.',
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
