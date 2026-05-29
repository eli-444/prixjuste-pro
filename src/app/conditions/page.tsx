import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function ConditionsPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Conditions d'utilisation</h1>
          <div className="mt-6 space-y-4 leading-7 text-slate-600">
            <p>
              Tarifly est propose par Aurora Web & Security, SIRET 99124922800016. Pour toute question ou reclamation,
              vous pouvez ecrire a aurorawebsec@gmail.com.
            </p>
            <p>
              L'achat premium donne acces aux fonctionnalites avancees de Tarifly. Lorsque Supabase et Stripe sont
              configures, cet acces est rattache au compte utilisateur connecte.
            </p>
            <p>
              Les calculs fournis sont bases sur les informations saisies par l'utilisateur. L'utilisateur reste seul
              responsable de ses decisions commerciales, tarifaires, comptables et fiscales.
            </p>
            <p>
              Les paiements sont executes par Stripe. Tarifly ne collecte ni ne conserve les donnees de carte bancaire.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
