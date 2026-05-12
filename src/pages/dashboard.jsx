import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Circle, Clock3, ListChecks, BookMarked } from "lucide-react";
import { format, differenceInMilliseconds } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Card } from "../components/ui/card";

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

export default function Dashboard() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [happeningNow, setHappeningNow] = useState(null);
  const [upNext, setUpNext] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [dashboardStats, setDashboardStats] = useState([
    { value: "0", label: "Classes Today", color: "text-[var(--accent-strong)]" },
    { value: "0", label: "Urgent Tasks", color: "text-[#cf4c4a]" },
    { value: "0", label: "Ongoing Tasks", color: "text-[var(--text-primary)]" },
  ]);
  const [priorityTasks, setPriorityTasks] = useState([]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");

    if (justLoggedIn === "true") {
      setShowWelcome(true);

      const timer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.removeItem("justLoggedIn");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const today = new Date().getDay();

      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedule")
        .select("*, subjects(id, name, color)")
        .eq("user_id", user.id)
        .eq("day_of_week", today);

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
      } else {
        setSchedule(scheduleData || []);
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*, subjects(id, name, color)")
        .eq("user_id", user.id)
        .not("status", "eq", "done");

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
      } else {
        setTasks(tasksData || []);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = {
      urgent: 0,
      ongoing: 1,
    };

    const aStatus = a.status?.toLowerCase();
    const bStatus = b.status?.toLowerCase();

    // PRIORITIZE CURRENT SUBJECT FIRST
    if (happeningNow?.subjects?.id) {
      const currentSubjectId = happeningNow.subjects.id;

      const aIsCurrent = a.subjects?.id === currentSubjectId;
      const bIsCurrent = b.subjects?.id === currentSubjectId;

      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
    }

    // THEN SORT BY STATUS
    const aPriority = statusOrder[aStatus] ?? 99;
    const bPriority = statusOrder[bStatus] ?? 99;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // THEN SORT BY DEADLINE
    const aDeadline = a.deadline ? new Date(a.deadline) : null;
    const bDeadline = b.deadline ? new Date(b.deadline) : null;

    if (aDeadline && bDeadline) {
      return aDeadline - bDeadline;
    }

    if (aDeadline) return -1;
    if (bDeadline) return 1;

    return 0;
  });

    setPriorityTasks(sortedTasks);
  }, [tasks, happeningNow]);

  useEffect(() => {
    const timeToDate = (timeString) => {
      if (!timeString) return new Date();
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date;
    };

    const sortedSchedule = [...schedule].sort(
      (a, b) => timeToDate(a.start_time) - timeToDate(b.start_time)
    );

    const now = currentTime;

    const currentClass = sortedSchedule.find((c) => {
      const startTime = timeToDate(c.start_time);
      const endTime = timeToDate(c.end_time);
      return now >= startTime && now <= endTime;
    });

    const nextClass = sortedSchedule.find((c) => {
      const startTime = timeToDate(c.start_time);
      return startTime > now;
    });

    setHappeningNow(currentClass || null);
    setUpNext(nextClass || null);

    // Countdown logic
    let countdownInterval;
    if (nextClass) {
      countdownInterval = setInterval(() => {
        const now = new Date();
        const nextClassTime = timeToDate(nextClass.start_time);
        const diff = differenceInMilliseconds(nextClassTime, now);

        if (diff <= 0) {
          setCountdown("Starting now");
          clearInterval(countdownInterval);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setCountdown("");
    }

    const urgentTasksCount = tasks.filter(
      (t) => t.status && t.status.toLowerCase() === "urgent"
    ).length;
    const ongoingTasksCount = tasks.filter(
      (t) => t.status && t.status.toLowerCase() === "ongoing"
    ).length;

    setDashboardStats([
      {
        value: schedule.length,
        label: "Classes Today",
        color: "text-[var(--accent-strong)]",
      },
      { value: urgentTasksCount, label: "Urgent Tasks", color: "text-[#cf4c4a]" },
      {
        value: ongoingTasksCount,
        label: "Ongoing Tasks",
        color: "text-[var(--text-primary)]",
      },
    ]);

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [currentTime, schedule, tasks]);

  return (
    <>
        {showWelcome && (
      <div className="fixed top-5 right-5 z-50 rounded-2xl bg-[var(--accent)] px-5 py-4 text-white shadow-xl transition-all duration-300">
        <p className="text-lg font-semibold">
          Welcome {user?.displayName ? `, ${user.displayName}` : ""}!
        </p>

        <p className="text-sm opacity-90">
          Ready to plan your day?
        </p>
      </div>
    )}
    
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
              const statusColors = {
                urgent: 'text-red-600',
                ongoing: 'text-orange-500',
                done: 'text-green-600',
              };

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
                      {/* TASK TITLE */}
                      <p className="text-xl font-semibold text-[var(--text-primary)]">
                        {task.title}
                      </p>

                      {/* STATUS BADGE */}
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

                      {/* SUBJECT */}
                      <p className="text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        {task.subjects?.name || "No Subject"}
                      </p>
                      {task.subjects?.id === happeningNow?.subjects?.id && (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-strong)]">
                          Current Subject
                        </p>
                      )}
                    </div>

                    {/* SUBJECT COLOR DOT */}
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