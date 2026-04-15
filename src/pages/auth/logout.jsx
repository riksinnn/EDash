import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";

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

  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-6 py-10 text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full max-w-xl rounded-[30px] border border-[var(--app-border)] bg-[var(--app-panel)] p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <LogOut size={28} />
          </div>
          <h1 className="mt-5 font-serif text-5xl font-semibold text-[var(--text-primary)]">
            Logging out
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">{status}</p>
          <div className="mt-8">
            <Button variant="outline" onClick={() => navigate("/login", { replace: true })}>
              Back to Login
            </Button>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Need access again? <Link to="/login" className="text-[var(--accent)]">Sign in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
