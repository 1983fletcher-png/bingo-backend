/**
 * Feud player: 1–3 short phrase answers, submit. Realtime: socket feud:submit.
 */
import { useState } from 'react';
import type { Socket } from 'socket.io-client';
import '../styles/join.css';

type Props = { code: string; socket: Socket | null };

export function FeudPlayerForm({ code, socket }: Props) {
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answers = [a1.trim(), a2.trim(), a3.trim()].filter(Boolean);
    if (!socket || answers.length === 0) return;
    const codeUpper = code.toUpperCase();
    if (import.meta.env?.DEV) console.log('[FeudPlayerForm] feud:submit', { code: codeUpper, answers });
    socket.emit('feud:submit', { code: codeUpper, answers });
    setSubmitted(true);
  };
  if (submitted) {
    return <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500 }}>Thanks! Your answers are in.</p>;
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input type="text" className="join-page__input" placeholder="Answer 1" value={a1} onChange={(e) => setA1(e.target.value)} autoComplete="off" />
      <input type="text" className="join-page__input" placeholder="Answer 2 (optional)" value={a2} onChange={(e) => setA2(e.target.value)} autoComplete="off" />
      <input type="text" className="join-page__input" placeholder="Answer 3 (optional)" value={a3} onChange={(e) => setA3(e.target.value)} autoComplete="off" />
      <button type="submit" className="join-page__btn" disabled={!a1.trim()}>Submit</button>
    </form>
  );
}
