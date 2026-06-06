type EmailResult = 'sent' | 'skipped' | 'failed';

type QuoteStatusEmailInput = {
  to: string | null | undefined;
  status: 'accepted' | 'refused';
  quoteNumber: string;
  clientName?: string;
  totalIncludingTax?: number;
  publicToken?: string;
};

const resendEndpoint = 'https://api.resend.com/emails';

export async function sendQuoteStatusEmail(input: QuoteStatusEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = input.to?.trim();

  if (!apiKey || !recipient) {
    return 'skipped';
  }

  const appUrl = getAppUrl();
  const quoteUrl = input.publicToken ? `${appUrl}/devis/${input.publicToken}` : appUrl;
  const isAccepted = input.status === 'accepted';
  const subject = isAccepted
    ? `Devis ${input.quoteNumber} accepté`
    : `Devis ${input.quoteNumber} refusé`;
  const statusLabel = isAccepted ? 'accepté' : 'refusé';
  const clientName = input.clientName?.trim() || 'Client non renseigné';
  const amount = formatCurrency(Number(input.totalIncludingTax ?? 0));

  try {
    const response = await fetch(resendEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Tarifly <no-reply@tarifly.app>',
        to: [recipient],
        reply_to: process.env.RESEND_REPLY_TO || 'aurorawebsec@gmail.com',
        subject,
        text: [
          `Le devis ${input.quoteNumber} a été ${statusLabel}.`,
          `Client : ${clientName}`,
          `Montant TTC : ${amount}`,
          `Lien du devis : ${quoteUrl}`,
          `Dashboard : ${appUrl}/dashboard/suivi-demarches`,
        ].join('\n'),
        html: buildQuoteStatusHtml({
          subject,
          statusLabel,
          quoteNumber: input.quoteNumber,
          clientName,
          amount,
          quoteUrl,
          dashboardUrl: `${appUrl}/dashboard/suivi-demarches`,
          isAccepted,
        }),
      }),
    });

    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

function buildQuoteStatusHtml({
  subject,
  statusLabel,
  quoteNumber,
  clientName,
  amount,
  quoteUrl,
  dashboardUrl,
  isAccepted,
}: {
  subject: string;
  statusLabel: string;
  quoteNumber: string;
  clientName: string;
  amount: string;
  quoteUrl: string;
  dashboardUrl: string;
  isAccepted: boolean;
}) {
  const accent = isAccepted ? '#00b878' : '#ef4444';
  const badgeBackground = isAccepted ? '#ecfdf5' : '#fef2f2';

  return `
    <div style="margin:0;background:#f6f8fb;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#05051f;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dfe5ef;border-radius:18px;overflow:hidden;">
        <div style="padding:28px 32px;border-bottom:1px solid #e8edf5;">
          <p style="margin:0 0 10px;color:#4f46ff;font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;">Tarifly</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;color:#05051f;">${escapeHtml(subject)}</h1>
        </div>
        <div style="padding:28px 32px;">
          <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#334155;">
            Le client a ${escapeHtml(statusLabel)} le devis. Vous pouvez retrouver le dossier dans votre dashboard Tarifly.
          </p>
          <div style="display:block;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            ${detailRow('Statut', statusLabel, accent, badgeBackground)}
            ${detailRow('Devis', quoteNumber)}
            ${detailRow('Client', clientName)}
            ${detailRow('Montant TTC', amount)}
          </div>
          <div style="margin-top:26px;">
            <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#05051f;color:#ffffff;text-decoration:none;font-weight:800;border-radius:12px;padding:14px 18px;">
              Ouvrir le dashboard
            </a>
            <a href="${escapeHtml(quoteUrl)}" style="display:inline-block;margin-left:10px;color:#4f46ff;text-decoration:none;font-weight:800;">
              Voir le devis
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function detailRow(label: string, value: string, color = '#05051f', background = '#ffffff') {
  return `
    <div style="display:flex;justify-content:space-between;gap:18px;padding:14px 16px;border-bottom:1px solid #e2e8f0;background:${background};">
      <span style="color:#64748b;font-size:14px;font-weight:700;">${escapeHtml(label)}</span>
      <span style="color:${color};font-size:14px;font-weight:900;text-align:right;">${escapeHtml(value)}</span>
    </div>
  `;
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://tarifly.app').replace(/\/$/, '');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
