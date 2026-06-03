import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UpdatePasswordForm } from '@/components/UpdatePasswordForm';

export default function UpdatePasswordPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pt-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Sécurité</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Choisissez un nouveau mot de passe.
            </h1>
            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Cette page fonctionne après ouverture du lien reçu par email. Une fois le mot de passe modifié, reconnectez-vous normalement.
            </p>
          </div>
          <UpdatePasswordForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
