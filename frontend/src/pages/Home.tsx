import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>The Playroom</h1>
      <p>Live games, trivia, edutainment &amp; team building.</p>
      <p>
        <Link to="/host">Host a game</Link> — create a room and share the link. Players join and see the waiting room with Roll Call (marble game) until you start.
      </p>
    </div>
  );
}
