import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckSquare, Clock3 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-6 py-10 text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <h1 className="font-serif text-4xl font-semibold text-[var(--accent)]">Edash</h1>
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </header>

        <main className="grid items-center gap-14 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Educational Dashboard
            </p>
            <h2 className="font-serif text-6xl font-semibold leading-[0.95] text-[var(--text-primary)] sm:text-7xl">
              Master your schedule, conquer your tasks.
            </h2>
            <p className="mt-6 max-w-xl text-2xl leading-relaxed text-[var(--text-secondary)]">
              A soft, focused planner for classes, rooms, reminders, and daily
              school flow. Built to feel like a digital leather notebook.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button onClick={() => navigate("/signup")}>
                Start Planning
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
            </div>
          </div>

          <section className="rounded-[34px] border border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_95%,transparent)] p-6 shadow-[var(--shadow-card)]">
            <div className="rounded-[28px] border border-[var(--app-border)] bg-[linear-gradient(180deg,_var(--app-panel-soft)_0%,_var(--app-panel)_100%)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    Today
                  </p>
                  <p className="mt-2 font-serif text-4xl font-semibold text-[var(--text-primary)]">
                    Wednesday
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-[var(--accent)]">
                  <Clock3 size={24} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <PreviewRow
                  icon={<CalendarDays size={22} />}
                  title="Now & Next Tracker"
                  description="See what class is active and what room comes next."
                />
                <PreviewRow
                  icon={<CheckSquare size={22} />}
                  title="Priority Tasks"
                  description="Track urgent, ongoing, and completed work in one place."
                />
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--app-border)] pt-6 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Installable PWA for students and educators
        </footer>
      </div>
    </div>
  );
}

function PreviewRow({ icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-lg text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
