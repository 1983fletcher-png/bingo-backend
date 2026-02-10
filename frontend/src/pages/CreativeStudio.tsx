import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportPdf, exportWeb, exportSocial, exportQrDataUrl, type StudioMode } from '../lib/creativeStudioExport';
import '../styles/CreativeStudio.css';

type SectionKind = 'items' | 'meta';

type Item = {
  id: string;
  name: string;
  description: string; // price removed
  price?: string;      // "$19.00", "MP", etc
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

type StudioDoc = {
  kind: 'menu_doc' | 'generic_doc';
  blocks: Block[];
};

type TriviaQ = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  sectionTitle?: string;
};

const AUTO_SAVE_KEY = 'creativeStudioAutoSaveRaw';

const DEFAULT_CONTENT = `Parkway Pizzas
Food Truck Hours
Monday–Thursday 11:30am–9:00pm
Friday 11:30am–11:00pm
Sunday 11:30am–8:00pm

Section: Pizzas
Balsam Cove Chicken BBQ Pizza - White sauce, white cheddar, grilled & diced chicken, bacon, red & green onions, tomatoes, swirled with sweet & tangy BBQ - $19
Thunderhead Mountain Meats Pizza - Tomato sauce, five cheese blend, pepperoni, salami, ham, and sausage - $21
Chestnut Mountain Cheese Pizza - Tomato sauce, our house blend of five cheeses - $17

Section: Kids
Kids Grilled Cheese - American on white bread - $10
Kids Corn Dog - Classic corn dog with side - $10
`;

/** ----------------- Utilities ----------------- */
function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function cleanWhitespace(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function isNoise(line: string) {
  const t = line.trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t)) return true;
  if (/^©/.test(t)) return true;
  const digits = (t.match(/\d/g) || []).length;
  if (digits >= 6 && digits >= t.length * 0.6) return true;
  if (/^\d{5}(-\d{4})?$/.test(t)) return true;
  return false;
}

function looksLikeMetaSectionTitle(title: string) {
  const l = title.toLowerCase();
  return (
    l.includes('hours') ||
    l.includes('open') ||
    l.includes('wifi') ||
    l.includes('address') ||
    l.includes('location') ||
    l.includes('contact') ||
    l.includes('parking') ||
    l.includes('rules')
  );
}

function normalizeSectionTitle(line: string) {
  let s = line.trim();
  s = s.replace(/^#+\s*/, '');
  s = s.replace(/^section:\s*/i, '');
  s = s.replace(/^menu:\s*/i, '');
  return cleanWhitespace(s);
}

function isSectionHeader(line: string) {
  const t = line.trim();
  if (!t) return false;
  if (/^#{1,3}\s+/.test(t)) return true;
  if (/^section:\s*/i.test(t)) return true;
  // short category-style lines (no numbers) are often headers
  if (t.length <= 36 && /^[A-Za-z0-9&/()' -]+$/.test(t) && !/\d/.test(t)) return true;
  return false;
}

function stripPriceFromTail(text: string): { desc: string; price?: string } {
  const t = text.trim();
  if (!t) return { desc: '' };

  // MP / Market Price
  if (/\b(market price|mp)\b/i.test(t)) {
    return { desc: cleanWhitespace(t.replace(/\b(market price|mp)\b/gi, '')), price: 'MP' };
  }

  // common end-of-line price tokens: $19, 19, 19.50, $19.5
  const m = t.match(/\s*[-–—]?\s*([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (!m) return { desc: t };

  const raw = m[1].replace(/\s/g, '');
  const currency = raw.startsWith('€') ? '€' : '$';
  const num = raw.replace(/[^0-9.]/g, '');
  const normalized = `${currency}${/\.\d{1,2}$/.test(num) ? num : `${num}.00`}`;
  const left = t.slice(0, t.length - m[0].length).trim();
  return { desc: left, price: normalized };
}

/**
 * Item parsing rule (dash format):
 * "Name - description - $price"
 * splits on dash-like separators; first chunk becomes name; remainder becomes description(+price)
 */
function parseItemLine(line: string): { name: string; description: string; price?: string } | null {
  const t = line.trim();
  if (!t || t.length < 3) return null;

  const parts = t.split(/\s*[-–—]\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const name = cleanWhitespace(parts[0]);
  const rest = cleanWhitespace(parts.slice(1).join(' – '));
  if (!name) return null;

  const { desc, price } = stripPriceFromTail(rest);
  return { name, description: cleanWhitespace(desc), price };
}

/** Normalize price from pipe segment: "$12.00", "12", "12.5", "TBD" => display string or "TBD". */
function normalizePipePrice(segment: string): string | undefined {
  const s = segment.trim();
  if (!s || /^tbd$/i.test(s)) return 'TBD';
  const m = s.match(/^([$€]?\s*\d+(?:\.\d{1,2})?)\s*$/);
  if (!m) return s || undefined;
  const raw = m[1].replace(/\s/g, '');
  const currency = raw.startsWith('€') ? '€' : '$';
  const num = raw.replace(/[^0-9.]/g, '');
  const normalized = /\.\d{1,2}$/.test(num) ? num : `${num}.00`;
  return `${currency}${normalized}`;
}

/**
 * Item parsing (pipe format): "Item | Description | Price"
 * Line must contain at least 2 pipes. Price may be "$12", "12.5", "TBD"; we keep TBD and do not drop the row.
 */
function parseItemLinePipe(line: string): { name: string; description: string; price?: string } | null {
  const t = line.trim();
  if (!t) return null;
  const pipeCount = (t.match(/\|/g) || []).length;
  if (pipeCount < 2) return null;

  const parts = t.split(/\|/).map((p) => p.trim());
  const name = cleanWhitespace(parts[0] ?? '');
  const description = cleanWhitespace(parts[1] ?? '');
  const priceSeg = parts[2] !== undefined ? normalizePipePrice(parts[2]) : undefined;
  if (!name) return null;

  return { name, description, price: priceSeg };
}

function parseToDoc(rawText: string): StudioDoc {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => !isNoise(l));

  const blocks: Block[] = [];
  let titleSet = false;
  let currentSection: Extract<Block, { type: 'section' }> | null = null;

  const hasPipeFormat = lines.some((l) => (l.match(/\|/g) || []).length >= 2);

  const ensureSection = (title: string, kind: SectionKind) => {
    const sec: Extract<Block, { type: 'section' }> = {
      type: 'section',
      id: uid('sec'),
      title,
      kind,
      tags: kind === 'meta' ? ['meta'] : [],
      items: [],
      metaLines: [],
    };
    blocks.push(sec);
    currentSection = sec;
    return sec;
  };

  for (const line of lines) {
    const pipeCount = (line.match(/\|/g) || []).length;

    if (!titleSet) {
      if (hasPipeFormat && pipeCount >= 2) {
        blocks.push({ type: 'title', text: 'Menu' });
        titleSet = true;
        const pipeItem = parseItemLinePipe(line);
        if (pipeItem) {
          const sec = ensureSection('Menu items', 'items');
          sec.items.push({ id: uid('item'), name: pipeItem.name, description: pipeItem.description, price: pipeItem.price, tags: [] });
        }
      } else if (hasPipeFormat && line.trim() && pipeCount === 0) {
        blocks.push({ type: 'title', text: 'Menu' });
        titleSet = true;
        const title = normalizeSectionTitle(line);
        const kind: SectionKind = looksLikeMetaSectionTitle(title) ? 'meta' : 'items';
        ensureSection(title, kind);
      } else {
        blocks.push({ type: 'title', text: line });
        titleSet = true;
      }
      continue;
    }

    // Pipe format: "Item | Description | Price" — deterministic; append to current section (or default "Menu items")
    if (pipeCount >= 2) {
      const pipeItem = parseItemLinePipe(line);
      if (pipeItem) {
        let sec = currentSection as Extract<Block, { type: 'section' }> | null;
        if (!sec || sec.kind !== 'items') sec = ensureSection('Menu items', 'items');
        sec.items.push({
          id: uid('item'),
          name: pipeItem.name,
          description: pipeItem.description,
          price: pipeItem.price,
          tags: [],
        });
      }
      continue;
    }

    // Section header: non-empty, no pipe (and existing heuristics for backward compat)
    if (isSectionHeader(line)) {
      const title = normalizeSectionTitle(line);
      const kind: SectionKind = looksLikeMetaSectionTitle(title) ? 'meta' : 'items';
      ensureSection(title, kind);
      continue;
    }

    // before any section: treat as subtitle until an item appears
    if (!currentSection) {
      const maybeItem = parseItemLine(line);
      if (maybeItem) {
        const sec = ensureSection('Menu items', 'items');
        sec.items.push({ id: uid('item'), name: maybeItem.name, description: maybeItem.description, price: maybeItem.price, tags: [] });
      } else {
        blocks.push({ type: 'subtitle', text: line });
      }
      continue;
    }

    const sec: Extract<Block, { type: 'section' }> = currentSection!;
    if (sec.kind === 'meta') {
      sec.metaLines.push(line);
      continue;
    }

    const item = parseItemLine(line);
    if (item) {
      sec.items.push({ id: uid('item'), name: item.name, description: item.description, price: item.price, tags: [] });
    } else {
      sec.metaLines.push(line);
    }
  }

  return { kind: 'menu_doc', blocks };
}

/** Parser test harness: run with sample pipe-format input. Expected: 2 sections, first has 2 items, second has 2 items. */
export function runCreativeStudioParserTest(): { ok: boolean; sections: number; sectionItems: number[] } {
  const input = `Swift Creek Starters
Onion Rings | Crispy battered onion rings | TBD
Mozzarella Sticks | Fried mozzarella sticks | TBD

Serenity Cove Salads
Sparrow Springs Salad | Arugula, spinach, apples | 15.50
Emerald Wedge Salad | Iceberg wedge | TBD`;
  const doc = parseToDoc(input);
  const sections = doc.blocks.filter((b): b is Extract<Block, { type: 'section' }> => b.type === 'section' && b.kind === 'items');
  const sectionItems = sections.map((s) => s.items.length);
  const ok = sections.length === 2 && sectionItems[0] === 2 && sectionItems[1] === 2;
  if (typeof console !== 'undefined' && console.log) {
    console.log('[Creative Studio parser test]', ok ? 'PASS' : 'FAIL', { sections: sections.length, sectionItems });
  }
  return { ok, sections: sections.length, sectionItems };
}

function docToCanonicalText(doc: StudioDoc): string {
  const out: string[] = [];

  for (const b of doc.blocks) {
    if (b.type === 'title') out.push(b.text);
    if (b.type === 'subtitle') out.push(b.text);
    if (b.type === 'section') {
      out.push('');
      out.push(`Section: ${b.title}`);

      if (b.kind === 'meta') {
        out.push(...b.metaLines);
      } else {
        for (const it of b.items) {
          const rhs = cleanWhitespace([it.description, it.price].filter(Boolean).join(' - '));
          out.push(`${it.name} - ${rhs}`.trim());
        }
        if (b.metaLines.length) out.push(...b.metaLines);
      }
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTrivia(doc: StudioDoc, count = 14): TriviaQ[] {
  const sections = doc.blocks.filter((b): b is Extract<Block, { type: 'section' }> => b.type === 'section' && b.kind === 'items');

  const all = sections.flatMap((s) =>
    s.items.map((it) => ({
      sectionId: s.id,
      sectionTitle: s.title,
      itemId: it.id,
      name: cleanWhitespace(it.name),
      desc: cleanWhitespace(it.description || ''),
    }))
  );

  // only use items with meaningful descriptions
  const usable = all.filter((x) => x.name && x.desc.length >= 6);
  const picked = shuffle(usable).slice(0, Math.min(count, usable.length));

  const qs: TriviaQ[] = [];

  for (const x of picked) {
    // prefer distractors from same section, then global
    const sameSection = usable.filter((y) => y.sectionId === x.sectionId && y.itemId !== x.itemId).map((y) => y.desc);
    const global = usable.filter((y) => y.itemId !== x.itemId).map((y) => y.desc);

    const distractors = shuffle([...sameSection, ...global])
      .map(cleanWhitespace)
      .filter((d) => d && d !== x.desc);

    const correct = x.desc;
    const options = shuffle([correct, ...distractors]).slice(0, 4);

    // guarantee 4 options if possible
    while (options.length < 4 && distractors.length > options.length) {
      options.push(distractors[options.length]);
    }

    const correctIndex = options.findIndex((o) => o === correct);

    qs.push({
      id: uid('q'),
      prompt: `What ingredients are in "${x.name}"?`,
      options,
      correctIndex: Math.max(0, correctIndex),
      sectionTitle: x.sectionTitle,
    });
  }

  // MIXED across the whole doc: shuffle final list so it jumps around
  return shuffle(qs);
}

export default function CreativeStudio() {
  const [rawInput, setRawInput] = useState(() => {
    try {
      return localStorage.getItem(AUTO_SAVE_KEY) ?? DEFAULT_CONTENT;
    } catch {
      return DEFAULT_CONTENT;
    }
  });

  const [mode, setMode] = useState<StudioMode>('MENU');
  const [qrUrl, setQrUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Derived doc from raw
  const parsedDoc = useMemo(() => parseToDoc(rawInput), [rawInput]);

  // Editable doc (structured) so we don't fight parsing while typing
  const [isEditing, setIsEditing] = useState(false);
  const [editDoc, setEditDoc] = useState<StudioDoc>(() => parseToDoc(rawInput));

  useEffect(() => {
    if (!isEditing) setEditDoc(parseToDoc(rawInput));
  }, [rawInput, isEditing]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTO_SAVE_KEY, rawInput);
    } catch {
      // ignore
    }
  }, [rawInput]);

  const activeDoc = isEditing ? editDoc : parsedDoc;

  useEffect(() => {
    if (import.meta.env.DEV) runCreativeStudioParserTest();
  }, []);

  const triviaQs = useMemo(() => buildTrivia(activeDoc, 18), [activeDoc]);

  const commitEditsToRaw = () => {
    setRawInput(docToCanonicalText(editDoc));
    setIsEditing(false);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setEditDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.type === 'section' && b.id === sectionId ? { ...b, title } : b)),
    }));
  };

  const updateItem = (sectionId: string, itemId: string, patch: Partial<Item>) => {
    setEditDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.type !== 'section' || b.id !== sectionId) return b;
        return { ...b, items: b.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) };
      }),
    }));
  };

  const addItem = (sectionId: string) => {
    setEditDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.type !== 'section' || b.id !== sectionId) return b;
        return { ...b, items: [...b.items, { id: uid('item'), name: 'New item', description: '', price: '', tags: [] }] };
      }),
    }));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setEditDoc((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => {
        if (b.type !== 'section' || b.id !== sectionId) return b;
        return { ...b, items: b.items.filter((it) => it.id !== itemId) };
      }),
    }));
  };

  const handleExportPdf = () => exportPdf(activeDoc, mode);
  const handleExportWeb = () => exportWeb(activeDoc, mode);
  const handleExportSocial = () => exportSocial(activeDoc, mode);

  const handleGenerateQr = async () => {
    const url = qrUrl.trim() || window.location.href;
    try {
      setQrDataUrl(await exportQrDataUrl(url));
    } catch {
      setQrDataUrl(null);
    }
  };

  return (
    <div className="creative-studio">
      <header className="creative-studio__header">
        <Link to="/" className="creative-studio__back">← Back to Playroom</Link>

        <div className="creative-studio__header-row">
          <div>
            <h1 className="creative-studio__heading">Creative Studio</h1>
            <p className="creative-studio__tagline">Paste once. Clean it up. Export menus, training, tests, and trivia.</p>
          </div>

          <div className="creative-studio__header-actions">
            <button
              type="button"
              className={`creative-studio__pill ${isEditing ? 'creative-studio__pill--on' : ''}`}
              onClick={() => setIsEditing((v) => !v)}
              title="Edit the structured menu"
            >
              {isEditing ? 'Editing: ON' : 'Editing: OFF'}
            </button>

            {isEditing && (
              <button type="button" className="creative-studio__btn" onClick={commitEditsToRaw}>
                Save edits
              </button>
            )}
          </div>
        </div>

        <Link to="/create/templates" className="creative-studio__templates-link">
          Browse template families (Hospitality, Education, Care, Business, General)
        </Link>
      </header>

      <section className="creative-studio__paste" aria-label="Paste content">
        <p className="creative-studio__paste-label">
          Paste from a website. Hours/notes get separated from real menu items. Prices become their own field.
        </p>
        <textarea
          className="creative-studio__textarea"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste text here..."
          rows={8}
        />
      </section>

      <section className="creative-studio__modes" aria-label="Display mode">
        <span className="creative-studio__modes-label">Mode:</span>
        <div className="creative-studio__mode-toggles">
          <button type="button" onClick={() => setMode('MENU')} className={`creative-studio__mode-btn ${mode === 'MENU' ? 'creative-studio__mode-btn--active' : ''}`}>MENU</button>
          <button type="button" onClick={() => setMode('TRAINING_STUDY')} className={`creative-studio__mode-btn ${mode === 'TRAINING_STUDY' ? 'creative-studio__mode-btn--active' : ''}`}>TRAINING</button>
          <button type="button" onClick={() => setMode('TRAINING_TEST')} className={`creative-studio__mode-btn ${mode === 'TRAINING_TEST' ? 'creative-studio__mode-btn--active' : ''}`}>TEST</button>
          <button type="button" onClick={() => setMode('TRIVIA')} className={`creative-studio__mode-btn ${mode === 'TRIVIA' ? 'creative-studio__mode-btn--active' : ''}`}>TRIVIA</button>
        </div>
      </section>

      <section className="creative-studio__workspace" aria-label="Preview">
        <h2 className="creative-studio__workspace-title">Preview</h2>

        {/* TRIVIA is intentionally NOT rendered per section — it's mixed across the whole document */}
        {mode === 'TRIVIA' && (
          <div className="creative-studio__section creative-studio__section--trivia">
            <h2 className="creative-studio__section-title">Mixed Trivia</h2>
            <p className="creative-studio__hint">
              Questions are mixed across the entire document to avoid section muscle-memory.
            </p>
            {triviaQs.length === 0 ? (
              <div className="creative-studio__meta-line">No usable items found yet. Add descriptions like "tomato sauce, cheese, basil…"</div>
            ) : (
              triviaQs.map((q, idx) => (
                <div key={q.id} className="creative-studio__trivia-block">
                  <div className="creative-studio__trivia-q">
                    <span className="creative-studio__trivia-num">{idx + 1}.</span> {q.prompt}
                    {q.sectionTitle && <span className="creative-studio__trivia-tag"> {q.sectionTitle}</span>}
                  </div>
                  <ul className="creative-studio__trivia-opts">
                    {q.options.map((opt, i) => (
                      <li key={`${q.id}-${i}`}>{opt}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        {mode !== 'TRIVIA' && (
          <div className="creative-studio__blocks">
            {activeDoc.blocks.map((b, bi) => {
              if (b.type === 'title') return <h1 key={`t-${bi}`} className="creative-studio__title creative-studio__title--center">{b.text}</h1>;
              if (b.type === 'subtitle') return <p key={`st-${bi}`} className="creative-studio__subtitle">{b.text}</p>;
              if (b.type !== 'section') return null;

              const isMeta = b.kind === 'meta';

              // TEST MODE
              if (mode === 'TRAINING_TEST') {
                if (isMeta) return null;
                return (
                  <div key={b.id} className="creative-studio__section creative-studio__section--test">
                    <h2 className="creative-studio__section-title">{b.title}</h2>
                    {b.items.map((it) => (
                      <div key={it.id} className="creative-studio__test-item">
                        <div className="creative-studio__test-name">{it.name}</div>
                        <div className="creative-studio__blank-lines">
                          <div className="creative-studio__blank-line" />
                          <div className="creative-studio__blank-line" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // TRAINING MODE
              if (mode === 'TRAINING_STUDY') {
                if (isMeta) {
                  return (
                    <div key={b.id} className="creative-studio__section creative-studio__section--meta">
                      <h2 className="creative-studio__section-title">{b.title}</h2>
                      {b.metaLines.map((ln, i) => <div key={`${b.id}-m-${i}`} className="creative-studio__meta-line">{ln}</div>)}
                    </div>
                  );
                }
                return (
                  <div key={b.id} className="creative-studio__section creative-studio__section--training">
                    <h2 className="creative-studio__section-title">{b.title}</h2>
                    {b.items.map((it) => (
                      <div key={it.id} className="creative-studio__training-item">
                        <div className="creative-studio__training-name">{it.name}</div>
                        {it.description && <div className="creative-studio__training-desc">{it.description}</div>}
                      </div>
                    ))}
                  </div>
                );
              }

              // MENU MODE (default)
              return (
                <div key={b.id} className="creative-studio__section creative-studio__section--menu">
                  <div className="creative-studio__section-head">
                    {isEditing ? (
                      <input className="creative-studio__section-title-input" value={b.title} onChange={(e) => updateSectionTitle(b.id, e.target.value)} />
                    ) : (
                      <h2 className="creative-studio__section-title">{b.title}</h2>
                    )}

                    {!isMeta && isEditing && (
                      <button type="button" className="creative-studio__small-btn" onClick={() => addItem(b.id)}>+ Item</button>
                    )}
                  </div>

                  {isMeta ? (
                    <div className="creative-studio__meta">
                      {b.metaLines.map((ln, i) => <div key={`${b.id}-meta-${i}`} className="creative-studio__meta-line">{ln}</div>)}
                    </div>
                  ) : (
                    <div className="creative-studio__menu-list">
                      {b.items.map((it) => (
                        <div key={it.id} className="creative-studio__menu-item">
                          <div className="creative-studio__menu-row">
                            {isEditing ? (
                              <input className="creative-studio__menu-name-input" value={it.name} onChange={(e) => updateItem(b.id, it.id, { name: e.target.value })} />
                            ) : (
                              <div className="creative-studio__menu-name">{it.name}</div>
                            )}

                            <div className="creative-studio__menu-spacer" />

                            {isEditing ? (
                              <input className="creative-studio__menu-price-input" value={it.price ?? ''} onChange={(e) => updateItem(b.id, it.id, { price: e.target.value })} placeholder="$" />
                            ) : (
                              (it.price != null && it.price !== '') ? <div className="creative-studio__menu-price">{it.price}</div> : <div />
                            )}

                            {isEditing && (
                              <button type="button" className="creative-studio__x-btn" onClick={() => removeItem(b.id, it.id)} aria-label="Remove item">×</button>
                            )}
                          </div>

                          {isEditing ? (
                            <textarea className="creative-studio__menu-desc-input" value={it.description} onChange={(e) => updateItem(b.id, it.id, { description: e.target.value })} placeholder="Description" rows={2} />
                          ) : (
                            it.description && <div className="creative-studio__menu-desc">{it.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="creative-studio__export" aria-label="Export">
        <h2 className="creative-studio__export-title">Export — one content, any output</h2>
        <p className="creative-studio__export-hint">PDF (print), Web (HTML), Social (new window), or QR for any URL.</p>
        <div className="creative-studio__export-btns">
          <button type="button" className="creative-studio__export-btn" onClick={handleExportPdf}>Export PDF</button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportWeb}>Export Web</button>
          <button type="button" className="creative-studio__export-btn" onClick={handleExportSocial}>Instagram / Facebook</button>
        </div>

        <div className="creative-studio__qr">
          <label className="creative-studio__qr-label">QR Code — paste any URL to encode:</label>
          <div className="creative-studio__qr-row">
            <input type="url" className="creative-studio__qr-input" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="https://..." />
            <button type="button" className="creative-studio__export-btn" onClick={handleGenerateQr}>Generate QR</button>
          </div>
          {qrDataUrl && (
            <div className="creative-studio__qr-preview">
              <img src={qrDataUrl} alt="QR code" width={200} height={200} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
