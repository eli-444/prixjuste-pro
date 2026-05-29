import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pt-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Mon compte</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Connectez-vous pour retrouver votre espace Tarifly.
            </h1>
            <p className="mt-5 max-w-xl leading-8 text-slate-600">
              Votre compte servira a relier vos futurs calculs, vos informations premium et vos achats Stripe a une
              vraie session utilisateur.
            </p>
          </div>
          <Suspense fallback={<div className="rounded-3xl bg-white p-8 shadow-soft">Chargement...</div>}>
            <LoginFormFromParams searchParams={searchParams} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}

async function LoginFormFromParams({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  return <AuthForm redirectTo={params.redirect ?? '/mon-compte'} />;
}
