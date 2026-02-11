/**
 * Player standby when host is reviewing. Per Activity Room spec §10.
 * Show when host has gone back or is in review so players see a calm waiting message.
 */
export function StandbyCard() {
  return (
    <div className="standby-card" role="status" aria-live="polite">
      <p className="standby-card__message">Host reviewing — next question starting soon.</p>
    </div>
  );
}
