import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckSquare, Clock3 } from "lucide-react";
import { Button } from "../../components/ui/button";
import logoLight from "../../assets/logo-light.svg";
import logoDark from "../../assets/logo-dark.svg";

export default function LandingView({ user, showWelcome }) {
  const navigate = useNavigate();
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const [localWelcome, setLocalWelcome] = useState(showWelcome);
  const [hoveredPreview, setHoveredPreview] = useState(null);
  const [visiblePreview, setVisiblePreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    setLocalWelcome(showWelcome);
  }, [showWelcome]);

  useEffect(() => {
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    if (!hoveredPreview) {
      setVisiblePreview(null);
      setPreviewOpen(false);
      return undefined;
    }

    previewTimerRef.current = window.setTimeout(() => {
      setVisiblePreview(hoveredPreview);
      window.requestAnimationFrame(() => setPreviewOpen(true));
    }, 160);

    return () => {
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
    };
  }, [hoveredPreview]);

  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-6 py-10 text-[var(--text-primary)]">
      {localWelcome ? (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-[var(--accent)] px-5 py-4 text-white shadow-xl transition-all duration-300">
          <p className="text-lg font-semibold">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ""}!
          </p>
          <p className="text-sm opacity-90">Ready to plan your day?</p>
        </div>
      ) : null}

      {visiblePreview ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-4 py-6">
          <div
            className={`w-full max-w-md rounded-[28px] border border-[var(--app-border)] bg-[var(--app-panel)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition-[opacity,transform] duration-500 ease-out ${
              previewOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Preview
            </p>
            <h3 className="mt-2 font-serif text-3xl font-semibold text-[var(--text-primary)]">
              {visiblePreview === "schedule" ? "Now & Next Tracker" : "Priority Tasks"}
            </h3>

            <div className="mt-5 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4">
              {visiblePreview === "schedule" ? <ScheduleMiniPreview /> : <TasksMiniPreview />}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <img
            src={isDark ? logoDark : logoLight}
            alt="Edash Logo"
            className="h-30 w-auto"
          />

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_10px_22px_rgba(111,143,88,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--accent-soft)]/80 hover:shadow-[0_14px_28px_rgba(111,143,88,0.18)]"
            >
              Log In
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/signup")}
              className="shadow-[0_10px_22px_rgba(127,117,96,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(127,117,96,0.16)]"
            >
              Sign Up
            </Button>
          </div>
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
              <Button
                onClick={() => navigate("/signup")}
                className="group transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(111,143,88,0.28)]"
              >
                Start Planning
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </div>
          </div>

          <section className="group rounded-[34px] border border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_95%,transparent)] p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(127,117,96,0.2)]">
            <div className="rounded-[28px] border border-[var(--app-border)] bg-[linear-gradient(180deg,_var(--app-panel-soft)_0%,_var(--app-panel)_100%)] p-6 transition-colors duration-300 group-hover:border-[var(--accent-soft)]">
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
                <div
                  className="group/preview relative"
                  onMouseEnter={() => setHoveredPreview("schedule")}
                  onMouseLeave={() => setHoveredPreview(null)}
                >
                  <PreviewRow
                    icon={<CalendarDays size={22} />}
                    title="Now & Next Tracker"
                    description="See what class is active and what room comes next."
                  />
                </div>

                <div
                  className="group/preview relative"
                  onMouseEnter={() => setHoveredPreview("tasks")}
                  onMouseLeave={() => setHoveredPreview(null)}
                >
                  <PreviewRow
                    icon={<CheckSquare size={22} />}
                    title="Priority Tasks"
                    description="Track urgent, ongoing, and completed work in one place."
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--app-border)] pt-6 text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
          A mobile-friendly web companion for students and educators
        </footer>
      </div>
    </div>
  );
}

function PreviewRow({ icon, title, description }) {
  return (
    <div className="group/row flex gap-4 rounded-[28px] border border-[var(--app-border)] bg-[var(--app-panel)] p-4 shadow-[0_8px_20px_rgba(127,117,96,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent-soft)] hover:bg-[var(--app-panel-soft)] hover:shadow-[0_14px_30px_rgba(127,117,96,0.12)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover/row:scale-110 group-hover:scale-110">
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[var(--accent)] group-hover/row:text-[var(--accent)]">
          {title}
        </p>
        <p className="mt-1 text-lg text-[var(--text-secondary)] transition-colors duration-300 group-hover:text-[var(--text-primary)]">
          {description}
        </p>
      </div>
    </div>
  );
}

function ScheduleMiniPreview() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const classes = [
    { title: "IT-ELECT 2 L", time: "12:30 PM - 1:30 PM", accent: "#f6c6ca" },
    { title: "IT-FREE EL 3", time: "1:30 PM - 2:30 PM", accent: "#8b5a17" },
    { title: "IT-SYSADMN32", time: "3:30 PM - 4:30 PM", accent: "#7ab8ff" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {days.map((day) => {
          const isActive = day === "WED";
          return (
            <div
              key={day}
              className={`rounded-[18px] border px-3 py-2 text-sm font-medium ${
                isActive
                  ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--app-panel)]"
                  : "border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--text-secondary)]"
              }`}
            >
              <span className="block text-center">{day}</span>
              <span className={isActive ? "mt-1 block text-center opacity-70" : "hidden"}>
                .
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 rounded-[22px] border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] p-4">
        {classes.map((item) => (
          <div
            key={item.title}
            className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-4"
            style={{ borderLeft: `5px solid ${item.accent}` }}
          >
            <p className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksMiniPreview() {
  const tasks = [
    { title: "Read chapter 4", status: "Urgent", accent: "#f6c6ca" },
    { title: "Math worksheet", status: "Ongoing", accent: "#8b5a17" },
    { title: "Submit project", status: "Done", accent: "#7ab8ff" },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-[22px] border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            Priority Tasks
          </p>
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            Today
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.title}
              className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-4"
              style={{ borderLeft: `5px solid ${task.accent}` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{task.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Track urgent, ongoing, and completed work in one place.
                  </p>
                </div>
                <span className="rounded-full bg-[var(--app-panel-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
