/**
 * QRCodePanel — Shared room join URL QR for host/display.
 * Uses current origin so QR always points to frontend.
 */
export interface QRCodePanelProps {
  /** Full join URL (e.g. window.location.origin + '/join/' + code or '/room/' + roomId) */
  joinUrl: string;
  /** Optional short label */
  label?: string;
  /** Pixel size of the QR image */
  size?: number;
  className?: string;
}

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/';

export function QRCodePanel({
  joinUrl,
  label = 'Scan to join',
  size = 200,
  className = '',
}: QRCodePanelProps) {
  if (!joinUrl.trim()) return null;
  const qrSrc = `${QR_API}?size=${size}x${size}&margin=8&data=${encodeURIComponent(joinUrl)}`;
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
      }}
    >
      {label && (
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
      )}
      <img
        src={qrSrc}
        alt="QR code to join"
        style={{ width: size, height: size, borderRadius: 8, border: '2px solid var(--border)' }}
      />
      <a
        href={joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all', maxWidth: size + 32 }}
      >
        {joinUrl}
      </a>
    </div>
  );
}
