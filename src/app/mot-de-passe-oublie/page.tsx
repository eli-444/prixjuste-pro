import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pt-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Mot de passe</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Recevez un lien pour reprendre la main sur votre compte.
            </h1>
            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Entrez l'email utilisé lors de votre inscription. Le lien ouvrira une page sécurisée pour choisir un nouveau mot de passe.
            </p>
            <Link href="/connexion" className="mt-6 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700">
              Retour à la connexion
            </Link>
          </div>
          <ForgotPasswordForm />
        </section>
      </main>
      <Footer />
    </>
  );
}

