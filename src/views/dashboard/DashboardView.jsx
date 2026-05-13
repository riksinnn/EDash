import { Link } from "react-router-dom";
import { ChevronRight, Circle, Clock3, ListChecks, BookMarked } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Card } from "../../components/ui/card";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const formatTime = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return "";

  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

function StatCard({ value, label, color }) {
  return (
    <Card className="p-6 text-center">
      <p className={cn("text-5xl font-semibold", color)}>{value}</p>
      <p className="mt-3 text-xl uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {label}
      </p>
    </Card>
  );
}

export default function DashboardView({
  showWelcome,
  user,
  currentTime,
  happeningNow,
  upNext,
  countdown,
  dashboardStats,
  priorityTasks,
}) {
  return (
    <>
      {showWelcome ? (
        <div className="fixed top-5 right-5 z-50 rounded-2xl bg-[var(--accent)] px-5 py-4 text-white shadow-xl transition-all duration-300">
          <p className="text-lg font-semibold">
            Welcome {user?.displayName ? `, ${user.displayName}` : ""}!
          </p>

          <p className="text-sm opacity-90">Ready to plan your day?</p>
        </div>
      ) : null}

      <div className="space-y-7">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h2 className="font-serif text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
              {format(currentTime, "EEEE, MMMM d")}
            </h2>
            <p className="mt-2 text-2xl text-[var(--text-secondary)]">
              Here is what&apos;s happening today.
            </p>
          </div>

          <Card className="inline-flex items-center gap-3 rounded-[24px] px-5 py-4">
            <Clock3 size={24} className="text-[var(--accent)]" />
            <span className="text-4xl font-medium text-[var(--text-primary)]">
              {format(currentTime, "h:mm a")}
            </span>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card
            className="bg-[radial-gradient(circle_at_top,_rgba(182,191,160,0.16),_transparent_62%),linear-gradient(180deg,_var(--app-panel-soft)_0%,_var(--app-panel)_100%)] p-7"
            style={{
              "--subject-color": happeningNow?.subjects?.color || "transparent",
            }}
          >
            <div className="flex items-center gap-3 text-xl font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <Circle size={10} fill="var(--subject-color)" color="var(--subject-color)" />
              <span>Happening Now</span>
            </div>
            <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
              {happeningNow ? (
                <>
                  <p className="text-4xl font-semibold text-[var(--text-primary)]">
                    {happeningNow.subjects.name}
                  </p>
                  <p className="mt-3 text-2xl text-[var(--text-secondary)]">
                    {formatTime(happeningNow.start_time)} - {formatTime(happeningNow.end_time)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-semibold text-[var(--text-primary)]">
                    No class right now
                  </p>
                  <p className="mt-3 text-2xl text-[var(--text-secondary)]">
                    Enjoy your free time!
                  </p>
                </>
              )}
            </div>
          </Card>

          <Card className="p-7">
            <h3 className="text-xl font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Up Next
            </h3>
            <div className="flex min-h-[170px] flex-col items-center justify-center text-center">
              {upNext ? (
                <>
                  <p className="text-4xl font-semibold text-[var(--text-primary)]">
                    {upNext.subjects.name}
                  </p>
                  <p className="mt-3 text-2xl text-[var(--text-secondary)]">
                    {formatTime(upNext.start_time)} - {formatTime(upNext.end_time)}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-[var(--accent-strong)]">
                    {countdown}
                  </p>
                </>
              ) : (
                <p className="text-3xl text-[var(--text-secondary)]">
                  No more classes today.
                </p>
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section>
          <Link
            to="/subjects"
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#354637] px-5 py-4 text-center text-lg font-semibold text-[#f7f4ee] shadow-[0_8px_24px_rgba(53,70,55,0.22)] transition-all duration-200 hover:bg-[#415744] hover:shadow-[0_10px_28px_rgba(53,70,55,0.28)]"
          >
            <BookMarked
              size={20}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            <span>Manage Subjects</span>
          </Link>
        </section>

        <section className="space-y-4 pt-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-4xl font-semibold text-[var(--text-primary)]">
              Priority Tasks
            </h3>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 text-2xl font-medium text-[var(--accent-strong)] transition-opacity hover:opacity-75"
            >
              <span>View all</span>
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="space-y-3">
            {priorityTasks.length > 0 ? (
              <div
                className={cn(
                  "space-y-3",
                  priorityTasks.length > 3 &&
                    "max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#d6cfbf] scrollbar-track-transparent"
                )}
              >
                {priorityTasks.map((task) => {
                  const status = task.status?.toLowerCase();

                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        "group rounded-2xl border bg-[var(--app-panel)] px-4 py-3 transition-all duration-200 hover:shadow-md",
                        task.subjects?.id === happeningNow?.subjects?.id
                          ? "border-[var(--accent)] shadow-sm"
                          : "border-[var(--app-border)]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-xl font-semibold text-[var(--text-primary)]">
                            {task.title}
                          </p>

                          <div>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px]",
                                status === "urgent" &&
                                  "bg-[var(--urgent-bg)] text-[var(--urgent-text)] uppercase",
                                status === "ongoing" &&
                                  "bg-[var(--ongoing-bg)] text-[var(--ongoing-text)] uppercase",
                                status === "done" &&
                                  "bg-[var(--done-bg)] text-[var(--done-text)] uppercase"
                              )}
                            >
                              {task.status}
                            </span>
                          </div>

                          <p className="text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            {task.subjects?.name || "No Subject"}
                          </p>
                          {task.subjects?.id === happeningNow?.subjects?.id ? (
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                              Current Subject
                            </p>
                          ) : null}
                        </div>

                        <div
                          className="mt-1 h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: task.subjects?.color || "#ccc",
                          }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="flex min-h-[190px] flex-col items-center justify-center border-dashed border-[var(--app-border)] p-6 text-center shadow-none">
                <ListChecks size={46} className="text-[var(--text-muted)]" />
                <p className="mt-4 text-2xl text-[var(--text-secondary)]">
                  All caught up for today!
                </p>
              </Card>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
