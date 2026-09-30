import { useState } from "react";
import Bear from "../components/Bear";

export default function Login({ login }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mobile-screen login-screen">
      <div className="login-content">
        <div className="brand">
          <Bear size={112} />
          <h1>Baobei</h1>
          <p>Closer hearts, wherever you are.</p>
        </div>

        <div className="form">
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="primary" onClick={login}>Log In</button>
        </div>

        <p className="signup">
          Don't have an account? <strong>Sign Up</strong>
        </p>
      </div>
    </div>
  );
}
