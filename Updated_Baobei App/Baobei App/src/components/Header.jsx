import { ChevronLeft } from "lucide-react";

export default function Header({ title, back }) {
  return (
    <header className="header">
      {back ? (
        <button className="round-btn" onClick={back}>
          <ChevronLeft size={22} />
        </button>
      ) : (
        <div className="header-spacer" />
      )}

      <h1>{title}</h1>
      <div className="header-spacer" />
    </header>
  );
}
