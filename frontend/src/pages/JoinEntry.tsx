import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/join.css';

export default function JoinEntry() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) navigate(`/join/${trimmed}`);
  };

  return (
    <div className="join-page">
      <Link to="/" className="join-page__back">
        ← Back to Playroom
      </Link>
      <h1 className="join-page__title">Join a room</h1>
      <p className="join-page__intro">
        Enter the game code your host shared. It&apos;s on the display screen or they can tell you.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. ABC12"
          maxLength={12}
          autoFocus
          className="join-page__input"
          aria-label="Game code"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="join-page__btn"
        >
          Join game
        </button>
      </form>
    </div>
  );
}
