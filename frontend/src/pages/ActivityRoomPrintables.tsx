/**
 * Activity Room — Printables: single PDF, Tonight's Kit, lamination masters.
 * @see docs/ACTIVITY-ROOM-SPEC.md §11
 */
import { useState } from 'react';
import { buildFeudPromptCardDocument } from '../lib/printMaterials';
import '../styles/activity-room.css';

type PrintableType = 'feud-prompt' | 'run-of-show' | 'score-sheet' | 'tonights-kit' | 'lamination';

function openPrintWindow(html: string, title: string): void {
  const w = window.open('', '_blank', 'noopener');
  if (!w) {
    alert('Please allow pop-ups to print.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.document.title = title;
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 300);
}

export default function ActivityRoomPrintables() {
  const [feudPrompt, setFeudPrompt] = useState('Name something you find at the beach');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSinglePdf = (type: PrintableType) => {
    if (type === 'feud-prompt') {
      const html = buildFeudPromptCardDocument(feudPrompt, 'Survey Showdown');
      openPrintWindow(html, 'Survey Showdown — Prompt Card');
      setFeedback('Opened print dialog for prompt card.');
    } else {
      setFeedback(`${type} PDF export is not yet available.`);
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleTonightKit = () => {
    setFeedback('Tonight\'s Kit (compiled multi-selection PDF) — coming soon.');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="activity-room__section">
      <h2 className="activity-room__section-title">Printables</h2>
      <p className="activity-room__section-intro">
        Download single-page PDFs or build a compiled &quot;Tonight&apos;s Kit&quot; for your event.
      </p>

      {feedback && (
        <p className="activity-room__feedback" role="status">
          {feedback}
        </p>
      )}

      <section className="activity-room__card" style={{ marginBottom: 24 }}>
        <h3>Single selection → one PDF</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 12 }}>
            <strong>Survey Showdown prompt card</strong>
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                value={feudPrompt}
                onChange={(e) => setFeudPrompt(e.target.value)}
                placeholder="e.g. Name something you find at the beach"
                style={{ width: '100%', maxWidth: 400, padding: 8, marginRight: 8, borderRadius: 6 }}
              />
              <button type="button" onClick={() => handleSinglePdf('feud-prompt')} className="activity-room__btn">
                Download PDF
              </button>
            </div>
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Run of show (1 page)</strong>
            <button type="button" onClick={() => handleSinglePdf('run-of-show')} className="activity-room__btn" style={{ marginLeft: 8 }}>
              Download PDF
            </button>
          </li>
          <li style={{ marginBottom: 12 }}>
            <strong>Score sheet</strong>
            <button type="button" onClick={() => handleSinglePdf('score-sheet')} className="activity-room__btn" style={{ marginLeft: 8 }}>
              Download PDF
            </button>
          </li>
        </ul>
      </section>

      <section className="activity-room__card" style={{ marginBottom: 24 }}>
        <h3>Multiple selections → Tonight&apos;s Kit</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Select several printables and compile into one PDF for your event.
        </p>
        <button type="button" onClick={handleTonightKit} className="activity-room__btn">
          Build Tonight&apos;s Kit
        </button>
      </section>

      <section className="activity-room__card">
        <h3>Lamination set</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Masters and storage labels for laminated materials.
        </p>
        <button type="button" onClick={() => { setFeedback('Lamination masters — coming soon.'); setTimeout(() => setFeedback(null), 4000); }} className="activity-room__btn">
          Download lamination set
        </button>
      </section>
    </div>
  );
}
