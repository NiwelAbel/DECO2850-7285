
import { useEffect, useState } from "react";
import { useBear } from "./BearConnection";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Live from "./pages/Live";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Onboarding from "./components/Onboarding";
import AppTutorial from "./components/AppTutorial";
import { completeOnboarding, hasCompletedOnboarding } from "./lib/experience";

export default function App() {
  const [page, setPage] = useState("login");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const { status } = useBear();
  const [bearState, setBearState] = useState("disconnected");

  useEffect(() => {
    setBearState(status.state);
  }, [status.state, status.eventId, status.detail]);

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
    setShowOnboarding(!hasCompletedOnboarding());
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
    setShowOnboarding(!hasCompletedOnboarding());
  }

  function finishOnboarding() {
    completeOnboarding();
    setShowOnboarding(false);
  }

  function replayOnboarding() {
    setPage("home");
    setShowOnboarding(true);
  }

  function startTutorial() {
    completeOnboarding();
    setShowOnboarding(false);
    setPage("home");
    setTutorialStep(0);
    setShowTutorial(true);
  }

  function finishTutorial() {
    setShowTutorial(false);
    setTutorialStep(0);
    setPage("home");
  }

  const onboarding = showOnboarding ? (
    <Onboarding onComplete={finishOnboarding} onStartTutorial={startTutorial} />
  ) : null;

  const tutorial = showTutorial ? (
    <AppTutorial
      currentPage={page}
      setPage={setPage}
      stepIndex={tutorialStep}
      onStepChange={setTutorialStep}
      onComplete={finishTutorial}
    />
  ) : null;

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
      <>
        <Home
          setPage={setPage}
          parent={parent}
          bearState={bearState}
          setBearState={setBearState}
        />
        {onboarding}
        {tutorial}
      </>
    );
  }

  if (page === "live") {
    return (
      <>
        <Live setPage={setPage} bearState={bearState} setBearState={setBearState} />
        {tutorial}
      </>
    );
  }

  if (page === "messages") {
    return <><Messages setPage={setPage} />{tutorial}</>;
  }

  if (page === "profile") {
    return (
      <>
        <Profile
          setPage={setPage}
          onLogout={handleLogout}
          onReplayIntroduction={replayOnboarding}
          onReplayTutorial={startTutorial}
        />
        {tutorial}
      </>
    );
  }

  // Fallback if an unknown page is selected.
  return <Home setPage={setPage} parent={parent} />;
}
