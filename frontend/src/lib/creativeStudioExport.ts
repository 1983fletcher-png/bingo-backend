/**
 * Creative Studio – VLC-style export: one content source, many outputs.
 * PDF (print), Web (download HTML), Social (sized HTML for screenshot), QR (encode URL).
 */
import QRCode from 'qrcode';

export type StudioMode = 'MENU' | 'TRAINING_STUDY' | 'TRAINING_TEST' | 'TRIVIA';

export interface ExportItem {
  name: string;
  description: string;
  price: string | null;
}

export interface ExportBlock {
  type: 'section' | 'title';
  content: string;
  items?: ExportItem[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildExportHtml(
  blocks: ExportBlock[],
  mode: StudioMode,
  options: { forPrint?: boolean; viewportWidth?: number } = {}
): string {
  const { forPrint = false, viewportWidth } = options;
  const bodyParts: string[] = [];

  blocks.forEach((block) => {
    if (block.type === 'title') {
      bodyParts.push(`<h1 class="cs-export-title">${escapeHtml(block.content)}</h1>`);
      return;
    }
    if (block.type === 'section' && block.items) {
      bodyParts.push(`<h2 class="cs-export-section">${escapeHtml(block.content)}</h2>`);
      block.items.forEach((item) => {
        if (mode === 'MENU') {
          const price = item.price ? ` <span class="cs-export-price">${escapeHtml(item.price)}</span>` : '';
          bodyParts.push(
            `<div class="cs-export-item"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.description)}</p>${price}</div>`
          );
        } else if (mode === 'TRAINING_STUDY') {
          bodyParts.push(
            `<div class="cs-export-item"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.description)}</p></div>`
          );
        } else if (mode === 'TRAINING_TEST') {
          bodyParts.push(
            `<div class="cs-export-item"><strong>${escapeHtml(item.name)}</strong><p class="cs-export-blank">__________________________</p></div>`
          );
        } else if (mode === 'TRIVIA') {
          bodyParts.push(
            `<div class="cs-export-trivia"><strong>Question:</strong> What ingredients are in a ${escapeHtml(item.name)}?<ul><li>Option 1: ${escapeHtml(item.description)}</li><li>Option 2: Dummy Option</li><li>Option 3: Dummy Option</li><li>Option 4: Dummy Option</li></ul></div>`
          );
        }
      });
    }
  });

  const viewportMeta =
    viewportWidth != null
      ? `<meta name="viewport" content="width=${viewportWidth}, initial-scale=1">`
      : '<meta name="viewport" content="width=device-width, initial-scale=1">';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${viewportMeta}
  <title>Creative Studio Export</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; color: #1a202c; background: #fff; line-height: 1.5; }
    .cs-export-title { font-size: 1.75rem; margin: 0 0 1rem; font-weight: 700; }
    .cs-export-section { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; font-weight: 600; color: #2d3748; }
    .cs-export-item { margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    .cs-export-item:last-child { border-bottom: none; }
    .cs-export-item strong { display: block; margin-bottom: 2px; }
    .cs-export-item p { margin: 0; color: #4a5568; }
    .cs-export-price { font-weight: 600; color: #2b6cb0; }
    .cs-export-blank { color: #a0aec0 !important; }
    .cs-export-trivia { margin-bottom: 1rem; padding: 0.75rem; background: #f7fafc; border-radius: 8px; }
    .cs-export-trivia ul { margin: 0.5rem 0 0; padding-left: 1.25rem; }
    ${forPrint ? '@media print { body { padding: 16px; } }' : ''}
  </style>
</head>
<body>
  ${bodyParts.join('\n  ')}
</body>
</html>`;
}

/** Open print dialog (user can choose "Save as PDF"). */
export function exportPdf(blocks: ExportBlock[], mode: StudioMode): void {
  const html = buildExportHtml(blocks, mode, { forPrint: true });
  const w = window.open('', '_blank');
  if (!w) {
    alert('Allow pop-ups to export PDF, or use Export Web and print from the opened file.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onafterprint = () => w.close();
  setTimeout(() => {
    try {
      w.print();
    } catch {
      w.close();
    }
  }, 250);
}

/** Download a standalone .html file. */
export function exportWeb(blocks: ExportBlock[], mode: StudioMode): void {
  const html = buildExportHtml(blocks, mode);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `creative-studio-export-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Open export in a new window sized for social (e.g. 1080x1080). User can screenshot or print to PDF. */
export function exportSocial(
  blocks: ExportBlock[],
  mode: StudioMode,
  size: { w: number; h: number } = { w: 1080, h: 1080 }
): void {
  const html = buildExportHtml(blocks, mode, { viewportWidth: size.w });
  const w = window.open('', '_blank', `width=${size.w},height=${size.h},scrollbars=yes`);
  if (!w) {
    alert('Allow pop-ups to export for social. Alternatively use Export Web and open the file.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
}

/** Generate QR code image as data URL for the given URL. Use in img src or download. */
export async function exportQrDataUrl(url: string, size = 256): Promise<string> {
  return QRCode.toDataURL(url, { width: size, margin: 2 });
}
