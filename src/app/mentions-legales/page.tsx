import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Mentions légales</h1>
          <div className="mt-6 space-y-4 leading-7 text-slate-600">
            <p>
              Tarifly est un service numérique édité par le propriétaire du site. Avant publication, complétez cette
              section avec vos informations légales : nom, statut, SIRET si applicable, adresse de contact et email.
            </p>
            <p>
              Le site propose un outil d'aide au calcul de prix. Les résultats sont indicatifs et ne remplacent pas un
              conseil comptable, juridique ou fiscal.
            </p>
            <p>
              Les paiements sont traités par Stripe. Aucune donnée bancaire n'est stockée par Tarifly.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
