/**
 * Creative Studio – VLC-style export: one content source, many outputs.
 * PDF (print), Web (download HTML), Social (sized HTML for screenshot), QR (encode URL).
 */
import QRCode from 'qrcode';

export type StudioMode = 'MENU' | 'TRAINING_STUDY' | 'TRAINING_TEST' | 'TRIVIA';

// Keep export accepting a structured doc so the exports match the UI exactly.
type SectionKind = 'items' | 'meta';

type Item = {
  id: string;
  name: string;
  description: string;
  price?: string;
  tags: string[];
};

type Block =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | {
      type: 'section';
      id: string;
      title: string;
      kind: SectionKind;
      tags: string[];
      items: Item[];
      metaLines: string[];
    };

export type StudioDoc = {
  kind: 'menu_doc' | 'generic_doc';
  blocks: Block[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanWhitespace(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMixedTrivia(doc: StudioDoc, count = 18) {
  const sections = doc.blocks.filter((b): b is Extract<Block, { type: 'section' }> => b.type === 'section' && b.kind === 'items');
  const all = sections.flatMap((s) => s.items.map((it) => ({
    sectionId: s.id,
    sectionTitle: s.title,
    itemId: it.id,
    name: cleanWhitespace(it.name),
    desc: cleanWhitespace(it.description || ''),
  })));
  const usable = all.filter((x) => x.name && x.desc.length >= 6);
  const picked = shuffle(usable).slice(0, Math.min(count, usable.length));

  return shuffle(picked.map((x) => {
    const same = usable.filter((y) => y.sectionId === x.sectionId && y.itemId !== x.itemId).map((y) => y.desc);
    const global = usable.filter((y) => y.itemId !== x.itemId).map((y) => y.desc);
    const distractors = shuffle([...same, ...global]).map(cleanWhitespace).filter((d) => d && d !== x.desc);
    const options = shuffle([x.desc, ...distractors]).slice(0, 4);
    while (options.length < 4 && distractors.length > options.length) options.push(distractors[options.length]);
    const correctIndex = Math.max(0, options.findIndex((o) => o === x.desc));
    return { prompt: `What ingredients are in "${x.name}"?`, options, correctIndex, sectionTitle: x.sectionTitle };
  }));
}

function buildExportHtml(doc: StudioDoc, mode: StudioMode, options: { forPrint?: boolean; viewportWidth?: number } = {}) {
  const { forPrint = false, viewportWidth } = options;

  const body: string[] = [];

  for (const b of doc.blocks) {
    if (b.type === 'title') {
      body.push(`<h1 class="cs-title">${escapeHtml(b.text)}</h1>`);
      continue;
    }
    if (b.type === 'subtitle') {
      body.push(`<p class="cs-subtitle">${escapeHtml(b.text)}</p>`);
      continue;
    }
    if (b.type === 'section') {
      // TRIVIA export is mixed across whole document — handled after loop
      if (mode === 'TRIVIA') {
        continue;
      }

      // TEST export
      if (mode === 'TRAINING_TEST') {
        if (b.kind === 'meta') continue;
        body.push(`<h2 class="cs-section">${escapeHtml(b.title)}</h2>`);
        for (const it of b.items) {
          body.push(
            `<div class="cs-test">
              <div class="cs-test-name">${escapeHtml(it.name)}</div>
              <div class="cs-blank"></div>
              <div class="cs-blank"></div>
            </div>`
          );
        }
        continue;
      }

      // TRAINING export
      if (mode === 'TRAINING_STUDY') {
        body.push(`<h2 class="cs-section">${escapeHtml(b.title)}</h2>`);
        if (b.kind === 'meta') {
          for (const ln of b.metaLines) body.push(`<div class="cs-meta">${escapeHtml(ln)}</div>`);
        } else {
          for (const it of b.items) {
            body.push(
              `<div class="cs-training">
                <div class="cs-training-name">${escapeHtml(it.name)}</div>
                ${it.description ? `<div class="cs-training-desc">${escapeHtml(it.description)}</div>` : ''}
              </div>`
            );
          }
        }
        continue;
      }

      // MENU export (default)
      body.push(`<h2 class="cs-section">${escapeHtml(b.title)}</h2>`);
      if (b.kind === 'meta') {
        for (const ln of b.metaLines) body.push(`<div class="cs-meta">${escapeHtml(ln)}</div>`);
      } else {
        for (const it of b.items) {
          body.push(
            `<div class="cs-menu-item">
              <div class="cs-menu-row">
                <div class="cs-menu-name">${escapeHtml(it.name)}</div>
                <div class="cs-menu-spacer"></div>
                <div class="cs-menu-price">${it.price ? escapeHtml(it.price) : ''}</div>
              </div>
              ${it.description ? `<div class="cs-menu-desc">${escapeHtml(it.description)}</div>` : ''}
            </div>`
          );
        }
      }
    }
  }

  // Mixed TRIVIA export at the end: one deck, shuffled
  if (mode === 'TRIVIA') {
    const qs = buildMixedTrivia(doc, 18);
    body.push(`<h2 class="cs-section">Mixed Trivia</h2>`);
    body.push(`<p class="cs-subtitle" style="text-align:left;margin-top:-6px">Mixed across the entire document to avoid section muscle-memory.</p>`);
    qs.forEach((q, idx) => {
      body.push(
        `<div class="cs-trivia">
          <div class="cs-q"><strong>${idx + 1}.</strong> ${escapeHtml(q.prompt)} <span class="cs-tag">${escapeHtml(q.sectionTitle || '')}</span></div>
          <ol class="cs-opts">
            ${q.options.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}
          </ol>
        </div>`
      );
    });
    // optional answer key for managers
    body.push(`<h2 class="cs-section">Answer Key</h2>`);
    body.push(`<ol class="cs-opts">` + qs.map((q, i) => `<li>Q${i + 1}: option ${q.correctIndex + 1}</li>`).join('') + `</ol>`);
  }

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
    *{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:24px;color:#111827;background:#fff;line-height:1.5}
    .cs-title{text-align:center;font-size:1.75rem;margin:0 0 .35rem;font-weight:800}
    .cs-subtitle{text-align:center;margin:0 0 1.25rem;color:#6b7280}
    .cs-section{margin:1.25rem 0 .6rem;font-size:1rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-bottom:2px solid #e5e7eb;padding-bottom:.25rem}
    .cs-meta{color:#374151;margin:.25rem 0}
    .cs-menu-item{padding:.5rem 0}
    .cs-menu-row{display:flex;align-items:baseline;gap:.75rem}
    .cs-menu-name{font-weight:700}
    .cs-menu-spacer{flex:1;border-bottom:1px dotted #d1d5db;transform:translateY(-2px)}
    .cs-menu-price{font-weight:800;white-space:nowrap}
    .cs-menu-desc{margin:.15rem 0 0;color:#6b7280;font-size:.95rem}
    .cs-training{padding:.5rem 0}
    .cs-training-name{font-weight:800}
    .cs-training-desc{color:#374151;margin-top:.15rem}
    .cs-test{padding:.55rem 0}
    .cs-test-name{font-weight:800}
    .cs-blank{height:18px;border-bottom:1px solid #111827;margin:.35rem 0}
    .cs-trivia{padding:.65rem .75rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin:.5rem 0}
    .cs-q{margin-bottom:.35rem}
    .cs-opts{margin:.25rem 0 0;padding-left:1.25rem}
    .cs-tag{color:#6b7280;font-size:.85rem;font-weight:600;margin-left:.4rem}
    ${forPrint ? '@media print { body{padding:16px} }' : ''}
  </style>
</head>
<body>
${body.join('\n')}
</body>
</html>`;
}

export function exportPdf(doc: StudioDoc, mode: StudioMode): void {
  const html = buildExportHtml(doc, mode, { forPrint: true });
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
    try { w.print(); } catch { w.close(); }
  }, 250);
}

export function exportWeb(doc: StudioDoc, mode: StudioMode): void {
  const html = buildExportHtml(doc, mode);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `creative-studio-export-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSocial(doc: StudioDoc, mode: StudioMode, size: { w: number; h: number } = { w: 1080, h: 1080 }): void {
  const html = buildExportHtml(doc, mode, { viewportWidth: size.w });
  const w = window.open('', '_blank', `width=${size.w},height=${size.h},scrollbars=yes`);
  if (!w) {
    alert('Allow pop-ups to export for social. Alternatively use Export Web and open the file.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
}

export async function exportQrDataUrl(url: string, size = 256): Promise<string> {
  return QRCode.toDataURL(url, { width: size, margin: 2 });
}
