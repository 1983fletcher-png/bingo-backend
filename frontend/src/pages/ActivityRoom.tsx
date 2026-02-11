/**
 * Activity Room — shell and hub for events, activities, training, game shows.
 * Replaces "Host a Room" as the parent home. Top nav: Build Tonight, Kits Library, Game Shows, Printables, Insights, Library.
 * @see docs/ACTIVITY-ROOM-SPEC.md
 */
import { Link, useLocation, Outlet } from 'react-router-dom';
import '../styles/activity-room.css';

const NAV_ITEMS = [
  { path: '/activity', label: 'Build Tonight' },
  { path: '/activity/kits', label: 'Kits Library' },
  { path: '/activity/game-shows', label: 'Game Shows' },
  { path: '/activity/printables', label: 'Printables' },
  { path: '/activity/insights', label: 'Insights' },
  { path: '/activity/library', label: 'Library' },
] as const;

export default function ActivityRoom() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="activity-room">
      <header className="activity-room__header">
        <Link to="/" className="activity-room__back">
          ← Back to Playroom
        </Link>
        <h1 className="activity-room__title">Activity Room</h1>
        <p className="activity-room__tagline">
          Plan, run, and print — trivia, game shows, kits, and printables in one place.
        </p>
        <nav className="activity-room__nav" aria-label="Activity Room">
          <ul className="activity-room__nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`activity-room__nav-link ${path === item.path ? 'activity-room__nav-link--on' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="activity-room__main">
        <Outlet />
      </main>
    </div>
  );
}
