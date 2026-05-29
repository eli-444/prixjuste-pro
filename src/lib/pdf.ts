type PdfLine = {
  type: 'text' | 'line' | 'rect';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  text?: string;
  size?: number;
  bold?: boolean;
};

const pageWidth = 595;
const pageHeight = 842;
const margin = 48;

export type TariflyPdfData = {
  title: string;
  subtitle: string;
  generatedAt: string;
  metrics: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; body: string | string[] }>;
};

export function createTariflyPdf(data: TariflyPdfData) {
  const lines: PdfLine[] = [];
  let y = margin;

  function addText(text: string, x = margin, size = 11, bold = false) {
    lines.push({ type: 'text', x, y, text, size, bold });
    y += size + 8;
  }

  function addWrappedText(text: string, x = margin, size = 10, bold = false, maxWidth = pageWidth - margin * 2) {
    const words = sanitizePdfText(text).split(/\s+/);
    let line = '';
    const maxChars = Math.max(28, Math.floor(maxWidth / (size * 0.48)));

    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars) {
        addText(line, x, size, bold);
        line = word;
      } else {
        line = next;
      }
    });

    if (line) {
      addText(line, x, size, bold);
    }
  }

  function addRule() {
    lines.push({ type: 'line', x: margin, y, w: pageWidth - margin * 2 });
    y += 18;
  }

  function ensureSpace(height: number) {
    if (y + height > pageHeight - margin) {
      y = margin;
      lines.push({ type: 'text', x: -1, y: -1, text: '__PAGE_BREAK__' });
    }
  }

  addText('Tarifly', margin, 18, true);
  addText(data.title, margin, 24, true);
  addWrappedText(data.subtitle, margin, 11, false);
  addText(`Genere le ${data.generatedAt}`, margin, 9);
  addRule();

  const cardGap = 12;
  const cardWidth = (pageWidth - margin * 2 - cardGap) / 2;
  data.metrics.forEach((metric, index) => {
    ensureSpace(86);
    const x = margin + (index % 2) * (cardWidth + cardGap);
    if (index > 0 && index % 2 === 0) {
      y += 90;
    }
    const cardY = y;
    lines.push({ type: 'rect', x, y: cardY, w: cardWidth, h: 72 });
    lines.push({ type: 'text', x: x + 14, y: cardY + 24, text: sanitizePdfText(metric.label), size: 9 });
    lines.push({ type: 'text', x: x + 14, y: cardY + 52, text: sanitizePdfText(metric.value), size: 16, bold: true });
  });
  y += data.metrics.length > 2 ? 178 : 90;
  addRule();

  data.sections.forEach((section) => {
    ensureSpace(90);
    addText(section.title, margin, 15, true);

    if (Array.isArray(section.body)) {
      section.body.forEach((item) => addWrappedText(`- ${item}`, margin + 10, 10));
    } else {
      addWrappedText(section.body, margin, 10);
    }

    y += 8;
  });

  return buildPdf(lines);
}

function buildPdf(lines: PdfLine[]) {
  const pages: PdfLine[][] = [[]];

  lines.forEach((line) => {
    if (line.text === '__PAGE_BREAK__') {
      pages.push([]);
      return;
    }
    pages[pages.length - 1].push(line);
  });

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];

  function addObject(content: string) {
    objects.push(content);
    return objects.length;
  }

  const fontRegular = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBold = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  pages.forEach((pageLines) => {
    const content = pageLines.map(renderLine).join('\n');
    const contentObject = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageObject = addObject(
      `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentObject} 0 R >>`,
    );
    pageObjectNumbers.push(pageObject);
  });

  const pagesObject = addObject(
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pageObjectNumbers.length} >>`,
  );
  const catalogObject = addObject(`<< /Type /Catalog /Pages ${pagesObject} 0 R >>`);

  const patchedObjects = objects.map((object) => object.replace('/Parent 0 0 R', `/Parent ${pagesObject} 0 R`));
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  patchedObjects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${patchedObjects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${patchedObjects.length + 1} /Root ${catalogObject} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function renderLine(line: PdfLine) {
  const x = line.x ?? margin;
  const y = pageHeight - (line.y ?? margin);

  if (line.type === 'line') {
    return `${x} ${y} m ${(line.x ?? margin) + (line.w ?? 0)} ${y} l S`;
  }

  if (line.type === 'rect') {
    return `${x} ${pageHeight - (line.y ?? margin) - (line.h ?? 0)} ${line.w ?? 0} ${line.h ?? 0} re S`;
  }

  const font = line.bold ? 'F2' : 'F1';
  return `BT /${font} ${line.size ?? 10} Tf ${x} ${y} Td (${escapePdfText(line.text ?? '')}) Tj ET`;
}

function sanitizePdfText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/€/g, 'EUR')
    .replace(/[^\x20-\x7E]/g, '');
}

function escapePdfText(text: string) {
  return sanitizePdfText(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
