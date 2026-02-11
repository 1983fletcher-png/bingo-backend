/**
 * Activity Room — Insights: Tonight's Takeaways, export PDF/CSV.
 * @see docs/ACTIVITY-ROOM-SPEC.md §12
 */
import { useState } from 'react';
import '../styles/activity-room.css';

export default function ActivityRoomInsights() {
  const [feedback, setFeedback] = useState<string | null>(null);

  const showComingSoon = (label: string) => {
    setFeedback(`${label} — coming soon.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="activity-room__section">
      <h2 className="activity-room__section-title">Insights</h2>
      <p className="activity-room__section-intro">
        After a session: top answers, emerging ideas, and suggested next kits. Export for records or sharing.
      </p>

      {feedback && (
        <p className="activity-room__feedback" role="status">
          {feedback}
        </p>
      )}

      <section className="activity-room__card" style={{ marginBottom: 24 }}>
        <h3>Tonight&apos;s Takeaways</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Top answers, emerging ideas, recommended follow-up kits. Available after you run a session.
        </p>
        <button type="button" onClick={() => showComingSoon('Tonight\'s Takeaways')} className="activity-room__btn">
          View takeaways
        </button>
      </section>

      <section className="activity-room__card" style={{ marginBottom: 24 }}>
        <h3>Export</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          PDF summary or CSV of session data (aggregate-only by default; full dataset optional).
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => showComingSoon('PDF summary')} className="activity-room__btn">
            Export PDF
          </button>
          <button type="button" onClick={() => showComingSoon('CSV export')} className="activity-room__btn">
            Export CSV
          </button>
        </div>
      </section>
    </div>
  );
}
