import { useState } from "react";
import { UserRound, Mail, Lock } from "lucide-react";

export default function Signup({ onSignup, goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parent, setParent] = useState("Mum");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    onSignup({
      name: name.trim(),
      email: email.trim(),
      password,
      parent
    });
  }

  return (
    <div className="mobile-screen login-screen">
      <div className="login-content signup-content">
        <div className="brand">
          <div className="bear signup-bear">🐻</div>
          <h1>Join Baobei</h1>
          <p>Closer hearts, wherever you are.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

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
            placeholder="Password (at least 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <div className="parent-selection">
            <p>Are you Mum or Dad?</p>

            <div className="parent-options">
              <button
                type="button"
                className={`parent-option ${
                  parent === "Mum" ? "selected" : ""
                }`}
                onClick={() => setParent("Mum")}
              >
                <span>👩</span>
                <strong>Mum</strong>
                {parent === "Mum" && <small>✓ Selected</small>}
              </button>

              <button
                type="button"
                className={`parent-option ${
                  parent === "Dad" ? "selected" : ""
                }`}
                onClick={() => setParent("Dad")}
              >
                <span>👨</span>
                <strong>Dad</strong>
                {parent === "Dad" && <small>✓ Selected</small>}
              </button>
            </div>
          </div>

          {error && <p className="signup-error">{error}</p>}

          <button className="primary" type="submit">
            Create Account
          </button>
        </form>

        <p className="signup">
          Already have an account?{" "}
          <strong onClick={goLogin} role="button" tabIndex={0}>
            Log In
          </strong>
        </p>
      </div>
    </div>
  );
}