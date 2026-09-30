export default function Bear({ size = 64 }) {
  return (
    <div
      className="bear"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28
      }}
    >
      <span style={{ fontSize: size * 0.55 }}>🐻</span>
    </div>
  );
}
