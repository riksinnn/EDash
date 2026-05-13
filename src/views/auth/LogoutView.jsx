import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function LogoutView({ status, onBackToLogin }) {
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
            <Button variant="outline" onClick={onBackToLogin}>
              Back to Login
            </Button>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Need access again?{" "}
            <Link to="/login" className="text-[var(--accent)]">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
