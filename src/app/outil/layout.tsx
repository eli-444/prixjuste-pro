import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculateur de prix rentable pour devis et prestations',
  description:
    'Utilisez Tarifly pour calculer un prix de vente rentable à partir de vos coûts, de votre temps, de vos frais, de votre TVA et de votre positionnement marché.',
  alternates: {
    canonical: '/outil',
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

