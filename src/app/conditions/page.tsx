import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

const sections = [
  {
    title: '1. Objet',
    body: [
      'Les presentes conditions encadrent l acces et l utilisation de Tarifly, service en ligne d aide au calcul de prix.',
      'Le service est edite par Aurora Web & Security, SIRET 99124922800016.',
    ],
  },
  {
    title: '2. Compte utilisateur',
    body: [
      'L acces aux fonctionnalites de compte necessite la creation d un compte avec une adresse email valide.',
      'L utilisateur est responsable de la confidentialite de ses identifiants et de l exactitude des informations renseignees.',
    ],
  },
  {
    title: '3. Abonnement Tarifly Premium',
    body: [
      'Tarifly Premium est un abonnement mensuel payant donnant acces aux fonctionnalites avancees : diagnostic complet, marge, niveau de risque, justification client, sauvegarde et export PDF professionnel.',
      'Le prix de l abonnement est affiche avant validation du paiement. Sauf mention contraire, il est indique toutes taxes comprises.',
      'L abonnement est reconduit chaque mois jusqu a resiliation par l utilisateur.',
    ],
  },
  {
    title: '4. Paiement',
    body: [
      'Les paiements sont traites par Stripe, prestataire de paiement securise.',
      'Tarifly ne conserve pas les donnees completes de carte bancaire.',
      'En validant le paiement, l utilisateur autorise le prelevement mensuel du montant indique lors de la souscription.',
    ],
  },
  {
    title: '5. Resiliation',
    body: [
      'L utilisateur peut resilier son abonnement en ligne depuis son espace compte via le bouton Gerer / resilier l abonnement.',
      'La resiliation prend effet selon les conditions affichees par Stripe au moment de la demande. L acces premium peut rester disponible jusqu a la fin de la periode deja payee si Stripe l indique.',
      'Aucun frais de resiliation n est applique par Tarifly.',
    ],
  },
  {
    title: '6. Droit de retractation',
    body: [
      'Pour les consommateurs, le droit de retractation legal peut s appliquer aux contrats conclus a distance.',
      'Lorsque l execution d un service numerique commence avant la fin du delai legal avec l accord expres du consommateur et, le cas echeant, renoncement au droit de retractation, ce droit peut etre limite conformement au droit applicable.',
      'Cette clause doit etre adaptee au parcours de paiement effectif et validee avant exploitation commerciale a grande echelle.',
    ],
  },
  {
    title: '7. Limites du service',
    body: [
      'Tarifly fournit une aide a la decision a partir des donnees saisies par l utilisateur.',
      'Les resultats ne remplacent pas un conseil comptable, fiscal, juridique ou financier personnalise.',
      'L utilisateur demeure seul responsable de ses prix, devis, marges, obligations fiscales et decisions commerciales.',
    ],
  },
  {
    title: '8. Disponibilite',
    body: [
      'Tarifly s efforce d assurer la disponibilite du service, sans garantir une disponibilite permanente ou exempte d interruption.',
      'Des operations de maintenance, incidents techniques ou interventions de prestataires tiers peuvent temporairement affecter le service.',
    ],
  },
  {
    title: '9. Donnees personnelles',
    body: [
      'Les donnees personnelles sont traitees pour fournir le service, gerer les comptes, assurer le paiement, sauvegarder les calculs et repondre aux demandes de support.',
      'L utilisateur peut exercer ses droits en ecrivant a aurorawebsec@gmail.com.',
    ],
  },
  {
    title: '10. Contact',
    body: ['Pour toute question, reclamation ou demande relative au service : aurorawebsec@gmail.com.'],
  },
];

export default function ConditionsPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-100 px-4 py-16">
        <article className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-soft md:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Cadre contractuel</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Conditions d'utilisation</h1>
          <p className="mt-4 leading-7 text-slate-600">Derniere mise a jour : 30 mai 2026.</p>

          <div className="mt-8 divide-y divide-slate-200">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-2 leading-7 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
