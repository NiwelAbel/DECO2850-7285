import { useState } from "react";

function Bear({ size = 112 }) {
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

export default function Login({ login, goSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    login(email.trim());
  }

  return (
    <div className="mobile-screen login-screen">
      <div className="login-content">
        <div className="brand">
          <Bear size={112} />
          <h1>Baobei</h1>
          <p>Closer hearts, wherever you are.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="primary" type="submit">
            Log In
          </button>
        </form>

        <p className="signup">
          Don't have an account?{" "}
          <strong
            onClick={goSignup}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") goSignup();
            }}
          >
            Sign Up
          </strong>
        </p>
      </div>
    </div>
  );
}