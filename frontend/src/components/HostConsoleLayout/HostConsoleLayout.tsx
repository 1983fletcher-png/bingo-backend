/**
 * HostConsoleLayout — shared production control console for Market Match, Survey Showdown, Crowd Control Trivia.
 * Single layout: Sidebar (collapsible), TopCommandBar, MainGameArea, PreviewDock (collapsible).
 * Only MainGameArea changes per game.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HostConsoleLayout.css';

const STORAGE_SIDEBAR = 'hostConsole.sidebarCollapsed';
const STORAGE_PREVIEW = 'hostConsole.previewDockMode';

export type PreviewDockMode = 'expanded' | 'compact' | 'collapsed';

export interface HostConsoleSidebarProps {
  gameCode: string;
  joinUrl: string;
  displayUrl: string;
  qrImageUrl: string;
  onCopyJoin: () => void;
  onCopyCode?: () => void;
  onPrintQR: () => void;
  onEndSession: () => void;
}

export interface HostConsoleTopBarProps {
  gameName: string;
  phaseChip: string;
  roomCode: string;
  onBackToPlayroom: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onJump?: (id: string) => void;
  onResetRound?: () => void;
  jumpCheckpoints?: { id: string; label: string }[];
  playersCount?: number;
  displayConnected?: boolean;
}

export interface HostConsolePreviewDockProps {
  joinUrl: string;
  displayUrl: string;
  /** Initial mode; persisted in localStorage. */
  defaultMode?: PreviewDockMode;
}

export interface HostConsoleLayoutProps {
  sidebar: HostConsoleSidebarProps;
  topBar: HostConsoleTopBarProps;
  previewDock: HostConsolePreviewDockProps;
  children: React.ReactNode;
}

function Sidebar({
  gameCode,
  joinUrl,
  displayUrl,
  qrImageUrl,
  onCopyJoin,
  onCopyCode,
  onPrintQR,
  onEndSession,
  collapsed,
  onToggleCollapse,
}: HostConsoleSidebarProps & { collapsed: boolean; onToggleCollapse: () => void }) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const handleCopyJoin = useCallback(() => {
    onCopyJoin();
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }, [onCopyJoin]);

  if (collapsed) {
    return (
      <aside className="host-console__sidebar host-console__sidebar--collapsed" aria-label="Session controls">
        <button
          type="button"
          className="host-console__sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          ◀
        </button>
        <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="host-console__sidebar-icon-link" title="Player view">
          📱
        </a>
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="host-console__sidebar-icon-link" title="Display (TV)">
          📺
        </a>
        <button type="button" className="host-console__sidebar-icon-btn" onClick={onPrintQR} title="Print QR">
          🖨
        </button>
        <button type="button" className="host-console__sidebar-icon-btn host-console__sidebar-icon-btn--danger" onClick={onEndSession} title="End session">
          ✕
        </button>
      </aside>
    );
  }

  return (
    <aside className="host-console__sidebar" aria-label="Share and session controls">
      <button
        type="button"
        className="host-console__sidebar-toggle"
        onClick={onToggleCollapse}
        aria-label="Collapse sidebar"
        title="Collapse sidebar"
      >
        ▶
      </button>
      <div className="host-console__sidebar-qr">
        <img src={qrImageUrl} alt="" width={200} height={200} aria-label="QR code to join" />
      </div>
      <div className="host-console__sidebar-code-row">
        <span className="host-console__sidebar-label">Game code</span>
        <span className="host-console__sidebar-code">{gameCode}</span>
        {onCopyCode && (
          <button type="button" className="host-console__sidebar-copy" onClick={onCopyCode} aria-label="Copy code">
            Copy
          </button>
        )}
      </div>
      <div className="host-console__sidebar-join-row">
        <span className="host-console__sidebar-join-url" title={joinUrl}>{joinUrl.replace(/^https?:\/\//, '').slice(0, 28)}…</span>
        <button type="button" className="host-console__sidebar-copy" onClick={handleCopyJoin}>
          {copyFeedback ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="host-console__sidebar-actions">
        <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="host-console__sidebar-btn">
          Player view
        </a>
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="host-console__sidebar-btn">
          Display (TV)
        </a>
        <button type="button" className="host-console__sidebar-btn" onClick={onPrintQR}>
          Print QR
        </button>
        <button type="button" className="host-console__sidebar-btn host-console__sidebar-btn--danger" onClick={onEndSession}>
          End session
        </button>
      </div>
    </aside>
  );
}

function TopCommandBar({
  gameName,
  phaseChip,
  roomCode,
  onBackToPlayroom,
  onPrev,
  onNext,
  onJump,
  onResetRound,
  jumpCheckpoints = [],
  playersCount,
  displayConnected,
}: HostConsoleTopBarProps) {
  const [jumpOpen, setJumpOpen] = useState(false);

  return (
    <header className="host-console__topbar" role="banner">
      <div className="host-console__topbar-left">
        <span className="host-console__topbar-game">{gameName}</span>
        <span className="host-console__topbar-phase">{phaseChip}</span>
        <span className="host-console__topbar-code" aria-label="Room code">{roomCode}</span>
      </div>
      <div className="host-console__topbar-center">
        <Link to="/host" className="host-console__topbar-btn" onClick={onBackToPlayroom}>
          Back to Playroom
        </Link>
        {onPrev != null && (
          <button type="button" className="host-console__topbar-btn" onClick={onPrev} title="Previous">
            Previous
          </button>
        )}
        {onNext != null && (
          <button type="button" className="host-console__topbar-btn host-console__topbar-btn--primary" onClick={onNext} title="Next">
            Next
          </button>
        )}
        {onJump != null && jumpCheckpoints.length > 0 && (
          <div className="host-console__topbar-jump">
            <button
              type="button"
              className="host-console__topbar-btn"
              onClick={() => setJumpOpen((o) => !o)}
              aria-expanded={jumpOpen}
              title="Jump to…"
            >
              Jump to…
            </button>
            {jumpOpen && (
              <ul className="host-console__topbar-jump-list">
                {jumpCheckpoints.map((cp) => (
                  <li key={cp.id}>
                    <button
                      type="button"
                      className="host-console__topbar-jump-item"
                      onClick={() => {
                        onJump(cp.id);
                        setJumpOpen(false);
                      }}
                    >
                      {cp.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {onResetRound != null && (
          <button type="button" className="host-console__topbar-btn host-console__topbar-btn--secondary" onClick={onResetRound} title="Reset round">
            Reset round
          </button>
        )}
      </div>
      <div className="host-console__topbar-right">
        {playersCount != null && (
          <span className="host-console__topbar-chip" title="Players connected">
            👥 {playersCount}
          </span>
        )}
        {displayConnected != null && (
          <span className={`host-console__topbar-chip ${displayConnected ? 'host-console__topbar-chip--ok' : ''}`} title="Display connected">
            {displayConnected ? '● Display' : '○ Display'}
          </span>
        )}
      </div>
    </header>
  );
}

function PreviewDock({
  joinUrl,
  displayUrl,
  mode,
  onModeChange,
}: HostConsolePreviewDockProps & { mode: PreviewDockMode; onModeChange: (m: PreviewDockMode) => void }) {
  const cycleMode = () => {
    const next: PreviewDockMode = mode === 'expanded' ? 'compact' : mode === 'compact' ? 'collapsed' : 'expanded';
    onModeChange(next);
  };

  if (mode === 'collapsed') {
    return (
      <div className="host-console__preview host-console__preview--collapsed">
        <button type="button" className="host-console__preview-toggle" onClick={cycleMode} title="Expand previews" aria-label="Expand previews">
          📺📱
        </button>
      </div>
    );
  }

  return (
    <div className={`host-console__preview host-console__preview--${mode}`}>
      <div className="host-console__preview-header">
        <span className="host-console__preview-title">Previews</span>
        <span className="host-console__preview-live">● Live</span>
        <button type="button" className="host-console__preview-toggle" onClick={cycleMode} title="Cycle size" aria-label="Cycle preview size">
          {mode === 'expanded' ? '⊟' : '⊞'}
        </button>
      </div>
      <div className="host-console__preview-body">
        <div className="host-console__preview-tv">
          <span className="host-console__preview-label">Display (TV)</span>
          <iframe title="Display (TV) preview" src={displayUrl} className="host-console__preview-iframe host-console__preview-iframe--tv" />
        </div>
        <div className="host-console__preview-phone">
          <span className="host-console__preview-label">Player</span>
          <iframe title="Player preview" src={joinUrl} className="host-console__preview-iframe host-console__preview-iframe--phone" />
        </div>
      </div>
    </div>
  );
}

export function HostConsoleLayout({ sidebar, topBar, previewDock, children }: HostConsoleLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_SIDEBAR) === 'true';
    } catch {
      return false;
    }
  });
  const [previewMode, setPreviewMode] = useState<PreviewDockMode>(() => {
    try {
      const v = localStorage.getItem(STORAGE_PREVIEW);
      if (v === 'expanded' || v === 'compact' || v === 'collapsed') return v;
    } catch {}
    return previewDock.defaultMode ?? 'expanded';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SIDEBAR, String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREVIEW, previewMode);
    } catch {}
  }, [previewMode]);

  return (
    <div className="host-console">
      <Sidebar
        {...sidebar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="host-console__main">
        <TopCommandBar {...topBar} />
        <div className="host-console__body">
          <div className="host-console__game-area">
            {children}
          </div>
          <PreviewDock
            {...previewDock}
            mode={previewMode}
            onModeChange={setPreviewMode}
          />
        </div>
      </div>
    </div>
  );
}
