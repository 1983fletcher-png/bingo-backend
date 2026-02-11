/**
 * Placeholder for Activity Room nav sections (Kits Library, Game Shows, Printables, Insights, Library).
 * Full implementation in later phases.
 */
type Props = { title: string; message?: string };

export default function ActivityRoomPlaceholder({ title, message = 'Coming soon.' }: Props) {
  return (
    <div className="activity-room__placeholder">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
