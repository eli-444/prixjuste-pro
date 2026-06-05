import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Aide et support',
  description: 'Aide Tarifly : abonnement, devis, signature client, données marché, résiliation et support.',
  alternates: {
    canonical: '/aide',
  },
};

const faqs = [
  {
    question: 'Mon paiement a réussi mais le Premium ne s’active pas, que faire ?',
    answer:
      'Rechargez d’abord l’application. Si l’accès reste bloqué, contactez le support avec l’e-mail de votre compte et l’heure approximative du paiement. Tarifly vérifiera le rattachement Stripe/Supabase.',
  },
  {
    question: 'Comment résilier mon abonnement ?',
    answer:
      'La résiliation se fait depuis le dashboard, dans Mon compte ou Facturation selon le portail disponible. L’accès reste actif jusqu’à la fin de la période déjà payée.',
  },
  {
    question: 'Les prix de marché sont-ils officiels ?',
    answer:
      'Non. Les données marché sont indicatives. Elles servent d’aide à la décision, mais ne remplacent pas une étude de marché, un devis concurrent ou votre propre analyse métier.',
  },
  {
    question: 'Le client doit-il créer un compte pour signer un devis ?',
    answer:
      'Non. Le lien public permet au client de consulter, télécharger, signer, accepter ou refuser le devis sans créer de compte Tarifly.',
  },
  {
    question: 'Que se passe-t-il si un client refuse un devis ?',
    answer:
      'Le statut est mis à jour dans le suivi des démarches. Un devis refusé ne doit pas alimenter les données marché comme un prix validé.',
  },
  {
    question: 'Pourquoi mes informations client sont-elles préremplies ?',
    answer:
      'Si vous créez un client depuis le portefeuille, Tarifly peut préremplir le calcul et le devis avec les informations connues afin d’éviter les doubles saisies.',
  },
  {
    question: 'Puis-je utiliser le devis tel quel juridiquement ?',
    answer:
      'Tarifly fournit un modèle professionnel, mais vous restez responsable des mentions obligatoires propres à votre statut, votre activité, votre régime fiscal et votre secteur.',
  },
  {
    question: 'Je n’arrive pas à réinitialiser mon mot de passe.',
    answer:
      'Demandez un nouveau lien depuis la page mot de passe oublié. Utilisez le dernier e-mail reçu, car les anciens liens peuvent expirer ou être invalidés.',
  },
];

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-8 shadow-soft md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Support</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Aide et questions fréquentes</h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Les réponses essentielles pour utiliser Tarifly, gérer votre abonnement et résoudre les problèmes les plus courants.
            </p>

            <div className="mt-8 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <summary className="cursor-pointer text-base font-black text-slate-950">{faq.question}</summary>
                  <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <h2 className="text-lg font-black text-slate-950">Besoin d’aide ?</h2>
              <p className="mt-2 leading-7 text-slate-600">
                Contactez le support avec l’e-mail de votre compte, une description courte du problème et, si possible, une capture
                d’écran.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="mailto:aurorawebsec@gmail.com"
                  className="rounded-xl bg-brand-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-950"
                >
                  Contacter le support
                </a>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-black text-brand-700 transition hover:bg-brand-50"
                >
                  Retour au dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
