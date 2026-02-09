/**
 * Trivia Room — Host panel: controls, toggles, dispute, timer, leaderboard.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type { RoomModel, PlayerModel, TriviaQuestionModel } from '../../lib/models';
import { isStartButtonEnabled, isStartReadyCheckEnabled } from '../../lib/models';
import { QuestionCard } from './QuestionCard';
import { TimerPill } from './TimerPill';
import { LeaderboardList } from './LeaderboardList';
import { QRCodePanel } from './QRCodePanel';
import { LivePreview } from './LivePreview';
import { getAnswerDisplayText } from './roomUtils';

export interface RoomHostPanelProps {
  room: RoomModel;
  players: PlayerModel[];
  currentQuestion: TriviaQuestionModel | null;
  responsesCount: number;
  leaderboardTop: PlayerModel[];
  pack?: { title?: string; questions?: unknown[] };
  socket: Socket | null;
  roomId: string;
}

export function RoomHostPanel({
  room,
  players,
  currentQuestion,
  responsesCount,
  leaderboardTop,
  pack,
  socket,
  roomId,
}: RoomHostPanelProps) {
  const [disputeVariant, setDisputeVariant] = useState('');
  const packLoaded = Boolean(pack?.questions?.length);
  const hostConnected = Boolean(socket?.connected);
  const startReadyCheckEnabled = isStartReadyCheckEnabled(room.state, packLoaded, hostConnected);
  const beginRoundEnabled = isStartButtonEnabled(room.state, packLoaded, hostConnected);
  const settings = room.settings || {};

  const setState = (nextState: RoomModel['state']) => {
    if (socket?.connected) socket.emit('room:host-set-state', { roomId, nextState });
  };

  const goNext = () => {
    if (socket?.connected) socket.emit('room:host-next', { roomId });
  };

  const toggleSetting = (key: string, value: boolean) => {
    if (socket?.connected) socket.emit('room:host-toggle-setting', { roomId, key, value });
  };

  const resolveDispute = (action: 'confirm' | 'accept_variant' | 'void') => {
    if (!socket?.connected || !currentQuestion) return;
    socket.emit('room:host-dispute-resolve', {
      roomId,
      questionId: currentQuestion.id,
      action,
      variantText: action === 'accept_variant' ? disputeVariant.trim() : undefined,
    });
    if (action === 'accept_variant') setDisputeVariant('');
  };

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}?role=player` : '';
  const displayUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}?role=display` : '';

  const copyJoinUrl = () => {
    if (joinUrl) {
      navigator.clipboard.writeText(joinUrl).catch(() => {});
    }
  };

  return (
    <div className="host-room" style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <p style={{ margin: '0 0 12px', fontSize: 14 }}>
        <Link to="/host?type=trivia" className="host-room__back-link">← Back to host</Link>
      </p>
      <div className="host-room__wrap">
        <aside className="host-room__left">
          <span className="host-room__section-label">Share with players</span>
          <div className="host-room__qr-block">
            <QRCodePanel joinUrl={joinUrl} label="Scan to join" size={160} />
            <p className="host-room__qr-hint">Room code</p>
            <p className="host-room__code">{roomId}</p>
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="host-room__display-link"
              style={{
                display: 'inline-block',
                marginTop: 12,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 600,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--accent)',
                textDecoration: 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              Display mode — open for TV
            </a>
          </div>
          <div className="host-room__join-row">
            <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="host-room__join-url" style={{ flex: '1 1 100%' }}>
              {joinUrl}
            </a>
            <button type="button" className="host-room__copy-btn" onClick={copyJoinUrl}>Copy link</button>
          </div>
          <p className="host-room__qr-sub" style={{ marginTop: 0 }}>
            {players.length} player(s) · {responsesCount} responses · {room.state}
          </p>
          <div style={{ marginTop: 16 }}>
            <span className="host-room__section-label">Options</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <input type="checkbox" checked={settings.leaderboardsVisibleToPlayers !== false} onChange={(e) => toggleSetting('leaderboardsVisibleToPlayers', e.target.checked)} />
                Leaderboard to players
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <input type="checkbox" checked={settings.leaderboardsVisibleOnDisplay !== false} onChange={(e) => toggleSetting('leaderboardsVisibleOnDisplay', e.target.checked)} />
                Leaderboard on display
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <input type="checkbox" checked={settings.mcTipsEnabled !== false} onChange={(e) => toggleSetting('mcTipsEnabled', e.target.checked)} />
                MC tips
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <input type="checkbox" checked={settings.autoAdvanceEnabled === true} onChange={(e) => toggleSetting('autoAdvanceEnabled', e.target.checked)} />
                Auto-advance
              </label>
            </div>
          </div>
        </aside>
        <main className="host-room__right">
          <div style={{ marginBottom: 16 }}>
            <h1 className="host-room__right-title" style={{ margin: '0 0 4px' }}>Host — {pack?.title || 'Trivia'}</h1>
            <p className="host-room__right-sub" style={{ margin: 0 }}>Player view and Display view below match what players and the TV see.</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <LivePreview room={room} currentQuestion={currentQuestion} pack={pack} leaderboardTop={leaderboardTop} />
          </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {room.state === 'WAITING_ROOM' && (
          <button className="join-page__btn" disabled={!startReadyCheckEnabled} onClick={() => setState('READY_CHECK')}>Start ready check</button>
        )}
        {room.state === 'READY_CHECK' && (
          <button className="join-page__btn" disabled={!beginRoundEnabled} onClick={() => setState('ACTIVE_ROUND')}>Begin round</button>
        )}
        {room.state === 'ACTIVE_ROUND' && (
          <button className="join-page__btn" onClick={() => setState('REVEAL')}>Reveal answer</button>
        )}
        {(room.state === 'REVEAL' || room.state === 'LEADERBOARD' || room.state === 'REVIEW') && (
          <button className="join-page__btn" onClick={goNext}>Next</button>
        )}
        {room.state !== 'END_ROOM' && (
          <button className="join-page__btn" style={{ background: 'var(--surface)', color: 'var(--text)' }} onClick={() => setState('END_ROOM')}>End room</button>
        )}
      </div>

      {currentQuestion && (room.state === 'ACTIVE_ROUND' || room.state === 'REVEAL') && (
        <div style={{ marginTop: 24 }}>
          {settings.mcTipsEnabled && currentQuestion.hostNotes?.mcTip && (
            <p style={{ margin: '0 0 12px', padding: 12, background: 'var(--surface)', borderRadius: 8, borderLeft: '4px solid var(--accent)', fontSize: 14, color: 'var(--text-muted)' }}>
              <strong>MC tip:</strong> {currentQuestion.hostNotes.mcTip}
            </p>
          )}
          <QuestionCard question={currentQuestion} size="normal" />
          {room.state === 'ACTIVE_ROUND' && (room.runtime.timeLimitSec ?? currentQuestion.timeLimitSec) != null && (
            <div style={{ marginTop: 12 }}>
              <TimerPill
                questionStartAt={room.runtime.questionStartAt}
                timeLimitSec={room.runtime.timeLimitSec ?? currentQuestion.timeLimitSec}
                active={room.state === 'ACTIVE_ROUND'}
                onExpire={() => {
                  if (room.state === 'ACTIVE_ROUND' && settings.autoAdvanceEnabled && socket?.connected) setState('REVEAL');
                }}
              />
            </div>
          )}
          {room.state === 'REVEAL' && (
            <p style={{ margin: '16px 0 0', padding: '12px 16px', background: 'var(--accent)', color: '#111', borderRadius: 8, fontSize: 20, fontWeight: 700 }}>
              Answer: {getAnswerDisplayText(currentQuestion)}
            </p>
          )}
          {room.state === 'REVEAL' && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>Dispute</h3>
              <button type="button" className="join-page__btn" style={{ marginBottom: 8 }} onClick={() => resolveDispute('confirm')}>Confirm official answer</button>
              <div style={{ marginBottom: 8 }}>
                <input type="text" placeholder="Accept variant (text)" value={disputeVariant} onChange={(e) => setDisputeVariant(e.target.value)} className="join-page__input" style={{ marginBottom: 4 }} />
                <button type="button" className="join-page__btn" onClick={() => resolveDispute('accept_variant')} disabled={!disputeVariant.trim()}>Accept variant</button>
              </div>
              <button type="button" className="join-page__btn" style={{ background: '#c00', color: '#fff' }} onClick={() => resolveDispute('void')}>Void question</button>
            </div>
          )}
        </div>
      )}

      {leaderboardTop.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <LeaderboardList players={leaderboardTop} limit={10} showPercentage />
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
