import { useEffect, useMemo, useState } from "react";
import { differenceInMilliseconds } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import DashboardView from "../views/dashboard/DashboardView";

function timeToDate(timeString) {
  if (!timeString) return new Date();
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(
    () => sessionStorage.getItem("justLoggedIn") === "true"
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showWelcome) return;

    sessionStorage.removeItem("justLoggedIn");
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, [showWelcome]);

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

  const sortedSchedule = useMemo(
    () => [...schedule].sort((a, b) => timeToDate(a.start_time) - timeToDate(b.start_time)),
    [schedule]
  );

  const happeningNow = useMemo(() => {
    return (
      sortedSchedule.find((entry) => {
        const startTime = timeToDate(entry.start_time);
        const endTime = timeToDate(entry.end_time);
        return currentTime >= startTime && currentTime <= endTime;
      }) || null
    );
  }, [currentTime, sortedSchedule]);

  const upNext = useMemo(() => {
    return sortedSchedule.find((entry) => timeToDate(entry.start_time) > currentTime) || null;
  }, [currentTime, sortedSchedule]);

  const priorityTasks = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const statusOrder = { urgent: 0, ongoing: 1 };
      const aStatus = a.status?.toLowerCase();
      const bStatus = b.status?.toLowerCase();

      if (happeningNow?.subjects?.id) {
        const currentSubjectId = happeningNow.subjects.id;
        const aIsCurrent = a.subjects?.id === currentSubjectId;
        const bIsCurrent = b.subjects?.id === currentSubjectId;

        if (aIsCurrent && !bIsCurrent) return -1;
        if (!aIsCurrent && bIsCurrent) return 1;
      }

      const aPriority = statusOrder[aStatus] ?? 99;
      const bPriority = statusOrder[bStatus] ?? 99;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      const aDeadline = a.deadline ? new Date(a.deadline) : null;
      const bDeadline = b.deadline ? new Date(b.deadline) : null;
      if (aDeadline && bDeadline) return aDeadline - bDeadline;
      if (aDeadline) return -1;
      if (bDeadline) return 1;
      return 0;
    });

    return sortedTasks;
  }, [tasks, happeningNow]);

  const dashboardStats = useMemo(() => {
    const urgentTasksCount = tasks.filter(
      (task) => task.status && task.status.toLowerCase() === "urgent"
    ).length;
    const ongoingTasksCount = tasks.filter(
      (task) => task.status && task.status.toLowerCase() === "ongoing"
    ).length;

    return [
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
    ];
  }, [schedule.length, tasks]);

  useEffect(() => {
    if (!upNext) return undefined;

    const countdownInterval = setInterval(() => {
      const now = new Date();
      const nextClassTime = timeToDate(upNext.start_time);
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
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`
      );
    }, 1000);

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [upNext]);

  return (
    <DashboardView
      showWelcome={showWelcome}
      user={user}
      currentTime={currentTime}
      happeningNow={happeningNow}
      upNext={upNext}
      countdown={upNext ? countdown : ""}
      dashboardStats={dashboardStats}
      priorityTasks={priorityTasks}
    />
  );
}
