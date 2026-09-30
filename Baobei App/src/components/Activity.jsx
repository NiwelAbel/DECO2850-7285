export default function Activity({ icon, title, time }) {
  return (
    <div className="activity">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{time}</small>
      </div>
    </div>
  );
}
