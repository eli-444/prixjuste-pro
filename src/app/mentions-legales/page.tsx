import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Mentions legales</h1>
          <div className="mt-6 space-y-4 leading-7 text-slate-600">
            <p>
              Tarifly est edite par Aurora Web & Security, agence proprietaire de cette application.
            </p>
            <p>SIRET : 99124922800016</p>
            <p>
              Contact en cas de probleme :{' '}
              <a href="mailto:aurorawebsec@gmail.com" className="font-semibold text-slate-950 hover:underline">
                aurorawebsec@gmail.com
              </a>
            </p>
            <p>
              Le site propose un outil d'aide au calcul de prix. Les resultats sont indicatifs et ne remplacent pas un
              conseil comptable, juridique ou fiscal.
            </p>
            <p>
              Les paiements sont traites par un prestataire de paiement securise. Aucune donnee bancaire n'est stockee
              par Tarifly.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
