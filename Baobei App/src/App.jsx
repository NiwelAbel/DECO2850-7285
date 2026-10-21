
import { useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Live from "./pages/Live";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

export default function App() {
  const [page, setPage] = useState("login");

  const [parent, setParent] = useState(
    () => localStorage.getItem("baobeiParent") || "Mum"
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("baobeiUser") || "null"
      );
    } catch {
      return null;
    }
  });

  function handleSignup(newUser) {
    localStorage.setItem(
      "baobeiUser",
      JSON.stringify(newUser)
    );

    localStorage.setItem(
      "baobeiParent",
      newUser.parent
    );

    setUser(newUser);
    setParent(newUser.parent);
    setPage("home");
  }

  function handleLogin(email) {
    let savedUser = null;

    try {
      savedUser = JSON.parse(
        localStorage.getItem("baobeiUser") || "null"
      );
    } catch {
      savedUser = null;
    }

    if (savedUser && savedUser.email === email) {
      setUser(savedUser);
      setParent(savedUser.parent || "Mum");
      localStorage.setItem(
        "baobeiParent",
        savedUser.parent || "Mum"
      );
    } else {
      // Demo mode: allow access even without a registered account.
      setUser(null);
      setParent(
        localStorage.getItem("baobeiParent") || "Mum"
      );
    }

    setPage("home");
  }

  function handleLogout() {
    // Preserve the registered prototype account.
    // Clear only the current session state.
    setUser(null);
    setPage("login");
  }

  if (page === "login") {
    return (
      <Login
        login={handleLogin}
        goSignup={() => setPage("signup")}
      />
    );
  }

  if (page === "signup") {
    return (
      <Signup
        onSignup={handleSignup}
        goLogin={() => setPage("login")}
      />
    );
  }

  if (page === "home") {
    return (
      <Home
        setPage={setPage}
        parent={parent}
      />
    );
  }

  if (page === "live") {
    return <Live setPage={setPage} />;
  }

  if (page === "messages") {
    return <Messages setPage={setPage} />;
  }

  if (page === "profile") {
    return (
      <Profile
        setPage={setPage}
        onLogout={handleLogout}
      />
    );
  }

  // Fallback if an unknown page is selected.
  return <Home setPage={setPage} parent={parent} />;
}
