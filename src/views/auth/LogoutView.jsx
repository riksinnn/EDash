import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function LogoutView({ status, onBackToLogin }) {
  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-4 py-6 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <section className="w-full max-w-xl rounded-[24px] border border-[var(--app-border)] bg-[var(--app-panel)] p-5 text-center shadow-[var(--shadow-card)] sm:rounded-[30px] sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <LogOut size={28} />
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
            Logging out
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] sm:text-lg">{status}</p>
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
