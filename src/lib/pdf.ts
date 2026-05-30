export type TariflyPdfData = {
  title: string;
  generatedAt: string;
  metrics: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; body: string | string[] }>;
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
  const logoWidth = 230;
  const logoHeight = Math.round((logo.height / logo.width) * logoWidth);
  ctx.drawImage(logo, margin, 54, logoWidth, logoHeight);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Genere le ${data.generatedAt}`, pageWidth - margin, 72);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 54px Arial';
  ctx.fillText(data.title, margin, 180);

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
