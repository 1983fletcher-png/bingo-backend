/**
 * Interactive Polling — Create Poll (single screen, no wizard).
 * Route: /poll/create → on success redirect to /poll/:pollId/host
 */
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSocket, getSocketBackendLabel, isBackendUrlSet } from '../lib/socket';

const POLL_HOST_KEY = 'playroom_poll_host';
const SAVED_QUESTIONS_KEY = 'playroom_poll_saved_questions';

const DEFAULT_QUESTIONS = [
  'What drink should we add to the menu?',
  'What food should we add to the menu?',
  'What kind of event would you like to see us host in the future?',
];

function saveHostToken(pollId: string, hostToken: string) {
  try {
    localStorage.setItem(POLL_HOST_KEY, JSON.stringify({ pollId, hostToken }));
  } catch (_) {}
}

function getSavedQuestions(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((q) => typeof q === 'string' && q.trim()) : [];
  } catch {
    return [];
  }
}

function saveQuestion(question: string) {
  if (!question.trim()) return;
  const saved = getSavedQuestions();
  const trimmed = question.trim();
  if (!saved.includes(trimmed)) {
    try {
      localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify([...saved, trimmed]));
    } catch (_) {}
  }
}

function deleteSavedQuestion(question: string) {
  const saved = getSavedQuestions();
  const filtered = saved.filter((q) => q !== question);
  try {
    localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

import type { Socket } from 'socket.io-client';
import '../styles/join.css';

type ResponseType = 'open' | 'multiple';

export default function PollCreate() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [question, setQuestion] = useState('');
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [responseType, setResponseType] = useState<ResponseType>('open');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [venueName, setVenueName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<string[]>(getSavedQuestions);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
    setConnected(s.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onCreated = (data: { pollId: string; hostToken: string }) => {
      setSubmitting(false);
      saveHostToken(data.pollId, data.hostToken);
      navigate(`/poll/${data.pollId}/host`, { replace: true, state: { hostToken: data.hostToken } });
    };
    const onErr = (data: { message?: string }) => {
      setSubmitting(false);
      setError(data?.message || 'Failed to create poll');
    };
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('poll:created', onCreated);
    s.on('poll:error', onErr);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('poll:created', onCreated);
      s.off('poll:error', onErr);
    };
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showQuestionDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-question-dropdown]')) {
        setShowQuestionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuestionDropdown]);

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const setOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const allQuestions = useMemo(() => [...DEFAULT_QUESTIONS, ...savedQuestions], [savedQuestions]);
  const isCustomQuestion = question.trim() && !allQuestions.includes(question.trim());
  const canSaveQuestion = isCustomQuestion && question.trim().length > 0;

  const handleSelectQuestion = (q: string) => {
    setQuestion(q);
    setShowQuestionDropdown(false);
  };

  const handleSaveQuestion = () => {
    const q = question.trim();
    if (!q) return;
    saveQuestion(q);
    setSavedQuestions(getSavedQuestions());
  };

  const handleDeleteQuestion = (q: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedQuestion(q);
    setSavedQuestions(getSavedQuestions());
    if (question.trim() === q) {
      setQuestion('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const q = question.trim();
    if (!q) {
      setError('Poll question is required');
      return;
    }
    if (!socket?.connected) {
      setError('Not connected to the server. See connection note below.');
      return;
    }
    setSubmitting(true);
    const opts = responseType === 'multiple'
      ? options.map((o) => o.trim()).filter(Boolean)
      : [];
    if (responseType === 'multiple' && opts.length < 2) {
      setError('Add at least 2 options for multiple choice');
      setSubmitting(false);
      return;
    }
    socket.emit('poll:create', {
      question: q,
      responseType,
      options: responseType === 'multiple' ? opts : undefined,
      venueName: venueName.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <div className="join-page" style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
      <p style={{ marginBottom: 24 }}>
        <Link to="/" className="join-page__back">← Back to Playroom</Link>
      </p>
      <h1 className="join-page__title" style={{ marginBottom: 8, fontSize: 'clamp(24px, 3vw, 32px)' }}>Create a poll</h1>
      <p className="join-page__intro" style={{ marginBottom: 32, fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
        One question, one QR. Collect live crowd input and see results instantly.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ position: 'relative' }} data-question-dropdown>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Poll question (required)</label>
            <button
              type="button"
              onClick={() => setShowQuestionDropdown(!showQuestionDropdown)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Quick select {showQuestionDropdown ? '▲' : '▼'}
            </button>
          </div>
          {showQuestionDropdown && (
            <div
              data-question-dropdown
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 100,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                marginTop: 4,
                maxHeight: 300,
                overflowY: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {allQuestions.length === 0 ? (
                <div style={{ padding: 12, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No saved questions yet
                </div>
              ) : (
                allQuestions.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectQuestion(q)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: i < allQuestions.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 14 }}>{q}</span>
                    {savedQuestions.includes(q) && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteQuestion(q, e)}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--error)',
                          cursor: 'pointer',
                          borderRadius: 4,
                        }}
                        title="Delete saved question"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onFocus={() => setShowQuestionDropdown(false)}
              placeholder="What drink should we add to the menu?"
              className="join-page__input"
              style={{ minHeight: 100, resize: 'vertical', marginBottom: 8, fontSize: 15, padding: '12px 16px' }}
              maxLength={300}
              required
            />
            {canSaveQuestion && (
              <button
                type="button"
                onClick={handleSaveQuestion}
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 12,
                  padding: '6px 12px',
                  fontSize: 12,
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                title="Save this question for quick access"
              >
                Save question
              </button>
            )}
          </div>
        </div>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Response type</legend>
          <div style={{ display: 'flex', gap: 16 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                background: responseType === 'open' ? 'var(--accent)' : 'var(--surface)',
                color: responseType === 'open' ? '#fff' : 'var(--text)',
                border: `2px solid ${responseType === 'open' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                flex: 1,
                transition: 'all 0.2s',
                fontWeight: responseType === 'open' ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name="responseType"
                checked={responseType === 'open'}
                onChange={() => setResponseType('open')}
                style={{ margin: 0 }}
              />
              Open text
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                background: responseType === 'multiple' ? 'var(--accent)' : 'var(--surface)',
                color: responseType === 'multiple' ? '#fff' : 'var(--text)',
                border: `2px solid ${responseType === 'multiple' ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                flex: 1,
                transition: 'all 0.2s',
                fontWeight: responseType === 'multiple' ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name="responseType"
                checked={responseType === 'multiple'}
                onChange={() => setResponseType('multiple')}
                style={{ margin: 0 }}
              />
              Multiple choice
            </label>
          </div>
        </fieldset>

        {responseType === 'multiple' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Multiple choice options (max 10)</label>
              <button
                type="button"
                onClick={addOption}
                disabled={options.length >= 10}
                className="join-page__btn"
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  opacity: options.length >= 10 ? 0.5 : 1,
                  cursor: options.length >= 10 ? 'not-allowed' : 'pointer',
                }}
              >
                Add option
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="join-page__input"
                    style={{ flex: 1, marginBottom: 0, fontSize: 15, padding: '10px 14px' }}
                    maxLength={80}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={options.length <= 2}
                    style={{
                      padding: '10px 16px',
                      background: options.length <= 2 ? 'var(--surface)' : 'var(--error)',
                      color: options.length <= 2 ? 'var(--text-muted)' : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: options.length <= 2 ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      minWidth: 80,
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Venue name (optional)</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Your venue or event name"
              className="join-page__input"
              style={{ fontSize: 15, padding: '10px 14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Logo URL (optional)</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://… image URL for display"
              className="join-page__input"
              style={{ fontSize: 15, padding: '10px 14px' }}
            />
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8 }}>
          Display: Top 8 results · Group similar answers · Profanity filter — all on by default.
        </p>

        <div style={{ padding: 16, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{connected ? '●' : '○'}</span>
            {connected ? 'Connected to server' : 'Connecting to server…'}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            This build connects to: <strong>{getSocketBackendLabel()}</strong>
            {!isBackendUrlSet() && !import.meta.env.DEV && (
              <span style={{ color: 'var(--warning)' }}> — wrong for production</span>
            )}
          </p>
          {!isBackendUrlSet() && !import.meta.env.DEV && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--warning)' }}>
              In Netlify → Site configuration → Environment variables, add <strong>VITE_SOCKET_URL</strong> = your Railway URL (no trailing slash). Then Deploys → Trigger deploy (or Clear cache and deploy). The URL is baked in at build time.
            </p>
          )}
        </div>

        {error && (
          <div style={{ padding: 12, background: 'var(--error)', color: '#fff', borderRadius: 8, fontSize: 14 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="join-page__btn"
          disabled={submitting || !connected}
          style={{
            padding: '14px 24px',
            fontSize: 16,
            fontWeight: 600,
            opacity: submitting || !connected ? 0.6 : 1,
            cursor: submitting || !connected ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Creating…' : connected ? 'Start poll' : 'Connect to start'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', maxWidth: 600, lineHeight: 1.6 }}>
        Live site? Set <strong>VITE_SOCKET_URL</strong> in Netlify to your Railway backend URL (no trailing slash) and redeploy so the app can connect.
      </p>
    </div>
  );
}
