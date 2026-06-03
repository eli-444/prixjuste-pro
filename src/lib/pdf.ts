export type TariflyPdfData = {
  title: string;
  generatedAt: string;
  metrics: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; body: string | string[] }>;
};

export type TariflyQuoteData = {
  quoteNumber: string;
  quoteDate: string;
  company: {
    name: string;
    siret?: string;
    address: string;
    email?: string;
    phone?: string;
  };
  client: {
    name: string;
    address: string;
    email?: string;
  };
  items: Array<{
    description: string;
    quantity: string;
    unit: string;
    unitPriceExcludingTax: string;
    totalExcludingTax: string;
  }>;
  totals: {
    subtotalExcludingTax: string;
    taxRate: string;
    taxAmount: string;
    totalIncludingTax: string;
  };
  validityDays: string;
};

const pageWidth = 1240;
const pageHeight = 1754;
const margin = 96;

export async function createTariflyPdf(data: TariflyPdfData) {
  const logo = await loadImage('/logo.png');
  const pages: Uint8Array[] = [];
  let canvas = createPage();
  let ctx = getContext(canvas);
  let y = drawHeader(ctx, logo, data);

  function newPage() {
    drawFooter(ctx, pages.length + 1);
    pages.push(dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92)));
    canvas = createPage();
    ctx = getContext(canvas);
    y = drawHeader(ctx, logo, data);
  }

  function ensureSpace(height: number) {
    if (y + height > pageHeight - margin) {
      newPage();
    }
  }

  drawMetrics(ctx, data.metrics, y);
  y += Math.ceil(data.metrics.length / 2) * 160 + 58;

  data.sections.forEach((section) => {
    ensureSpace(150);
    y = drawSection(ctx, section, y, ensureSpace);
  });

  drawFooter(ctx, pages.length + 1);
  pages.push(dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92)));
  return buildImagePdf(pages);
}

export async function createQuotePdf(data: TariflyQuoteData) {
  const logo = await loadImage('/logo-nav.png');
  const canvas = createPage();
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Export PDF indisponible sur ce navigateur.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight);
  ctx.textBaseline = 'top';

  const logoWidth = 250;
  const logoHeight = Math.round((logo.height / logo.width) * logoWidth);
  ctx.drawImage(logo, margin, 64, logoWidth, logoHeight);

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 58px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('DEVIS', pageWidth - margin, 70);
  ctx.font = '600 24px Arial';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`N° ${data.quoteNumber}`, pageWidth - margin, 146);
  ctx.fillText(data.quoteDate, pageWidth - margin, 184);
  ctx.textAlign = 'left';

  drawQuoteParty(ctx, 'Emetteur', data.company.name, data.company.address, [data.company.siret ? `SIRET ${data.company.siret}` : undefined, data.company.email, data.company.phone], margin, 270);
  drawQuoteParty(ctx, 'Client', data.client.name, data.client.address, [data.client.email], 672, 270);

  let y = 560;
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 30px Arial';
  ctx.fillText('Prestation', margin, y);
  y += 56;

  roundedRect(ctx, margin, y, pageWidth - margin * 2, 88, 16);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px Arial';
  ctx.fillText('Description', margin + 28, y + 32);
  ctx.fillText('Qté', 720, y + 32);
  ctx.fillText('Unité', 810, y + 32);
  ctx.fillText('PU HT', 930, y + 32);
  ctx.textAlign = 'right';
  ctx.fillText('Total HT', pageWidth - margin - 28, y + 32);
  ctx.textAlign = 'left';
  y += 88;

  data.items.slice(0, 8).forEach((item, index) => {
    const descriptionLines = wrapText(ctx, item.description, 560, 22).slice(0, 3);
    const rowHeight = Math.max(92, 34 + descriptionLines.length * 32 + 24);

    roundedRect(ctx, margin, y, pageWidth - margin * 2, rowHeight, index === data.items.length - 1 ? 16 : 10);
    ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = '600 22px Arial';
    descriptionLines.forEach((line, lineIndex) => {
      ctx.fillText(line, margin + 28, y + 24 + lineIndex * 32);
    });
    ctx.font = '500 21px Arial';
    ctx.fillText(item.quantity, 720, y + 28);
    ctx.fillText(item.unit, 810, y + 28);
    ctx.fillText(item.unitPriceExcludingTax, 930, y + 28);
    ctx.textAlign = 'right';
    ctx.fillText(item.totalExcludingTax, pageWidth - margin - 28, y + 28);
    ctx.textAlign = 'left';
    y += rowHeight + 10;
  });

  y += 36;

  const totalsX = 720;
  drawQuoteTotal(ctx, 'Total HT', data.totals.subtotalExcludingTax, totalsX, y);
  drawQuoteTotal(ctx, `TVA (${data.totals.taxRate})`, data.totals.taxAmount, totalsX, y + 62);
  roundedRect(ctx, totalsX, y + 132, pageWidth - margin - totalsX, 86, 16);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 24px Arial';
  ctx.fillText('Total TTC', totalsX + 28, y + 162);
  ctx.textAlign = 'right';
  ctx.fillText(data.totals.totalIncludingTax, pageWidth - margin - 28, y + 162);
  ctx.textAlign = 'left';

  y += 290;
  ctx.fillStyle = '#334155';
  ctx.font = '500 22px Arial';
  ctx.fillText(`Devis valable ${data.validityDays || '30'} jours a compter de sa date d emission.`, margin, y);
  ctx.fillText('Bon pour accord :', margin, y + 70);
  ctx.strokeStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(margin, y + 150);
  ctx.lineTo(margin + 360, y + 150);
  ctx.stroke();

  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(margin, pageHeight - 120);
  ctx.lineTo(pageWidth - margin, pageHeight - 120);
  ctx.stroke();
  ctx.fillStyle = '#64748b';
  ctx.font = '400 18px Arial';
  ctx.fillText('Document client genere depuis Tarifly.', margin, pageHeight - 86);

  return buildImagePdf([dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.94))]);
}

function createPage() {
  const canvas = document.createElement('canvas');
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  return canvas;
}

function getContext(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Export PDF indisponible sur ce navigateur.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, pageWidth, 310);
  ctx.strokeStyle = '#e2e8f0';
  ctx.fillStyle = '#0f172a';
  ctx.textBaseline = 'top';
  return ctx;
}

function drawHeader(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, data: TariflyPdfData) {
  const logoWidth = 190;
  const logoHeight = Math.round((logo.height / logo.width) * logoWidth);
  ctx.drawImage(logo, margin, 30, logoWidth, logoHeight);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Genere le ${data.generatedAt}`, pageWidth - margin, 58);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 54px Arial';
  ctx.fillText(data.title, margin, 176);

  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(margin, 250, 160, 8);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, 270);
  ctx.lineTo(pageWidth - margin, 270);
  ctx.stroke();

  return 318;
}

function drawMetrics(ctx: CanvasRenderingContext2D, metrics: TariflyPdfData['metrics'], startY: number) {
  const gap = 28;
  const cardWidth = (pageWidth - margin * 2 - gap) / 2;
  const cardHeight = 132;

  metrics.forEach((metric, index) => {
    const x = margin + (index % 2) * (cardWidth + gap);
    const y = startY + Math.floor(index / 2) * (cardHeight + gap);

    roundedRect(ctx, x, y, cardWidth, cardHeight, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 22px Arial';
    ctx.fillText(metric.label, x + 28, y + 26);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 34px Arial';
    ctx.fillText(metric.value, x + 28, y + 72);
  });
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  section: TariflyPdfData['sections'][number],
  startY: number,
  ensureSpace: (height: number) => void,
) {
  let y = startY;
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 32px Arial';
  ctx.fillText(section.title, margin, y);
  y += 54;

  const body = Array.isArray(section.body) ? section.body.map((item) => `• ${item}`) : [section.body];
  ctx.fillStyle = '#334155';
  ctx.font = '400 24px Arial';

  body.forEach((paragraph) => {
    const lines = wrapText(ctx, paragraph, pageWidth - margin * 2, 24);
    lines.forEach((line) => {
      ensureSpace(42);
      ctx.fillText(line, margin, y);
      y += 36;
    });
    y += 14;
  });

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, y + 10);
  ctx.lineTo(pageWidth - margin, y + 10);
  ctx.stroke();

  return y + 42;
}

function drawFooter(ctx: CanvasRenderingContext2D, pageNumber: number) {
  const footerY = pageHeight - 82;

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, footerY);
  ctx.lineTo(pageWidth - margin, footerY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '400 18px Arial';
  ctx.fillText(
    'Document indicatif. Ne remplace pas un conseil comptable, fiscal, juridique ou financier.',
    margin,
    footerY + 28,
  );

  ctx.textAlign = 'right';
  ctx.fillText(`Page ${pageNumber}`, pageWidth - margin, footerY + 28);
  ctx.textAlign = 'left';
}

function drawQuoteParty(
  ctx: CanvasRenderingContext2D,
  label: string,
  name: string,
  address: string,
  details: Array<string | undefined>,
  x: number,
  y: number,
) {
  roundedRect(ctx, x, y, 472, 210, 18);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px Arial';
  ctx.fillText(label.toUpperCase(), x + 28, y + 26);
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 26px Arial';
  ctx.fillText(name, x + 28, y + 62);

  ctx.fillStyle = '#334155';
  ctx.font = '400 20px Arial';
  const addressLines = address.split('\n').flatMap((line) => wrapText(ctx, line, 400, 20));
  addressLines.slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, x + 28, y + 104 + index * 28);
  });

  const detailsY = y + 104 + Math.max(1, addressLines.slice(0, 3).length) * 28 + 14;
  details.filter(Boolean).forEach((detail, index) => {
    ctx.fillText(detail as string, x + 28, detailsY + index * 26);
  });
}

function drawQuoteTotal(ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number) {
  ctx.fillStyle = '#64748b';
  ctx.font = '600 22px Arial';
  ctx.fillText(label, x + 28, y);
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(value, pageWidth - margin - 28, y);
  ctx.textAlign = 'left';
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number) {
  const words = normalizeText(text).split(/\s+/);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) {
    lines.push(line);
  }

  return lines.map((value) => (value.length > 120 ? value.slice(0, Math.floor(maxWidth / (fontSize * 0.45))) : value));
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Logo introuvable pour le PDF.'));
    image.src = src;
  });
}

function dataUrlToBytes(dataUrl: string) {
  const binary = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function buildImagePdf(images: Uint8Array[]) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const pageObjects: number[] = [];
  const pagesObject = images.length * 3 + 1;
  const catalogObject = images.length * 3 + 2;
  let objectNumber = 0;

  function pushAscii(value: string) {
    const bytes = encoder.encode(value);
    chunks.push(bytes);
    length += bytes.length;
  }

  function pushBytes(bytes: Uint8Array) {
    chunks.push(bytes);
    length += bytes.length;
  }

  function beginObject() {
    objectNumber += 1;
    offsets[objectNumber] = length;
    pushAscii(`${objectNumber} 0 obj\n`);
    return objectNumber;
  }

  function endObject() {
    pushAscii('\nendobj\n');
  }

  pushAscii('%PDF-1.4\n');

  images.forEach((image, index) => {
    const imageObject = beginObject();
    pushAscii(
      `<< /Type /XObject /Subtype /Image /Width ${pageWidth} /Height ${pageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,
    );
    pushBytes(image);
    pushAscii('\nendstream');
    endObject();

    const pageObject = beginObject();
    pageObjects.push(pageObject);
    pushAscii(
      `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im${index} ${imageObject} 0 R >> >> /Contents ${objectNumber + 1} 0 R >>`,
    );
    endObject();

    beginObject();
    const content = `q 595 0 0 842 0 0 cm /Im${index} Do Q`;
    pushAscii(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    endObject();
  });

  beginObject();
  pushAscii(`<< /Type /Pages /Kids [${pageObjects.map((page) => `${page} 0 R`).join(' ')}] /Count ${pageObjects.length} >>`);
  endObject();

  beginObject();
  pushAscii(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);
  endObject();

  const xrefOffset = length;
  const xref = [
    `xref\n0 ${objectNumber + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    `trailer\n<< /Size ${objectNumber + 1} /Root ${catalogObject} 0 R >>`,
    `startxref\n${xrefOffset}\n%%EOF`,
  ].join('\n');

  const finalChunks = [...chunks, encoder.encode(xref)];
  const finalLength = finalChunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(finalLength);
  let offset = 0;

  finalChunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });

  return new Blob([output.buffer], { type: 'application/pdf' });
}

function normalizeText(text: string) {
  return text.replace(/€/g, 'EUR').replace(/[“”]/g, '"').replace(/[’]/g, "'");
}
