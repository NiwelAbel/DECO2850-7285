import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Live from "./pages/Live";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

export default function App() {
  const [page, setPage] = useState("login");

  if (page === "login") return <Login login={() => setPage("home")} />;
  if (page === "home") return <Home setPage={setPage} />;
  if (page === "live") return <Live setPage={setPage} />;
  if (page === "messages") return <Messages setPage={setPage} />;

  return <Profile setPage={setPage} />;
}
