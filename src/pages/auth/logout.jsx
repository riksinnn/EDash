import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutView from "../../views/auth/LogoutView";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you out...");

  useEffect(() => {
    let isMounted = true;

    async function handleLogout() {
      try {
        await logout();
        if (isMounted) {
          setStatus("You have been logged out.");
          window.setTimeout(() => navigate("/login", { replace: true }), 500);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setStatus("We couldn't log you out right now.");
        }
      }
    }

    handleLogout();

    return () => {
      isMounted = false;
    };
  }, [logout, navigate]);

  return <LogoutView status={status} onBackToLogin={() => navigate("/login", { replace: true })} />;
}
