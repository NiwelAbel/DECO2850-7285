export default function Action({ icon, text, onClick }) {
  return (
    <button className="action" onClick={onClick}>
      <span>{icon}</span>
      <strong>{text}</strong>
    </button>
  );
}
