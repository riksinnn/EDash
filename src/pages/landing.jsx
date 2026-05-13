import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import LandingView from "../views/landing/LandingView";

export default function Landing() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(
    () => sessionStorage.getItem("justLoggedIn") === "true"
  );

  useEffect(() => {
    if (user && showWelcome) {
      sessionStorage.removeItem("justLoggedIn");

      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showWelcome, user]);

  return <LandingView user={user} showWelcome={showWelcome} />;
}
