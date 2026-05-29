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
              L'achat premium donne accès aux fonctionnalités avancées de Tarifly sur le navigateur utilisé après
              paiement.
            </p>
            <p>
              Les calculs fournis sont basés sur les informations saisies par l'utilisateur. L'utilisateur reste seul
              responsable de ses décisions commerciales, tarifaires, comptables et fiscales.
            </p>
            <p>
              Avant mise en ligne, adaptez cette page à votre activité réelle, votre pays, votre politique de
              remboursement et vos obligations légales.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
