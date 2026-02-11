/**
 * Activity Room — Library: org-private saved packs/sessions; share-to-community queue.
 * @see docs/ACTIVITY-ROOM-SPEC.md §12
 */
import { useState } from 'react';
import '../styles/activity-room.css';

export default function ActivityRoomLibrary() {
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="activity-room__section">
      <h2 className="activity-room__section-title">Library</h2>
      <p className="activity-room__section-intro">
        Saved packs and sessions are private to your organization. Optionally submit to the community (reviewed by admin).
      </p>

      {feedback && (
        <p className="activity-room__feedback" role="status">
          {feedback}
        </p>
      )}

      <section className="activity-room__card" style={{ marginBottom: 24 }}>
        <h3>Local Library</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Your saved game packs, run-of-show templates, and session data (org-private).
        </p>
        <button
          type="button"
          onClick={() => {
            setFeedback('Local Library — coming soon.');
            setTimeout(() => setFeedback(null), 4000);
          }}
          className="activity-room__btn"
        >
          Open library
        </button>
      </section>

      <section className="activity-room__card">
        <h3>Share to community</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Submit a pack or session for the community. Submissions are reviewed before going public.
        </p>
        <button
          type="button"
          onClick={() => {
            setFeedback('Share-to-community queue — coming soon.');
            setTimeout(() => setFeedback(null), 4000);
          }}
          className="activity-room__btn"
        >
          Submit for review
        </button>
      </section>
    </div>
  );
}
