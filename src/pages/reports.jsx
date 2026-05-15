import { useEffect, useMemo, useState } from "react";
import { endOfWeek, format, isWithinInterval, parseISO, startOfWeek, subWeeks } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { downloadCsv } from "../lib/export";
import { supabase } from "../lib/supabase";
import ReportsView from "../views/reports/ReportsView";

const weekOptions = { weekStartsOn: 1 };

function getTaskDate(task) {
  if (!task.deadline) return null;
  return typeof task.deadline === "string" ? parseISO(task.deadline) : new Date(task.deadline);
}

function summarizeWeek(tasks, weekStart) {
  const weekEnd = endOfWeek(weekStart, weekOptions);
  const weekTasks = tasks.filter((task) => {
    const taskDate = getTaskDate(task);
    return taskDate ? isWithinInterval(taskDate, { start: weekStart, end: weekEnd }) : false;
  });
  const done = weekTasks.filter((task) => task.status?.toLowerCase() === "done").length;
  const urgent = weekTasks.filter((task) => task.status?.toLowerCase() === "urgent").length;
  const ongoing = weekTasks.filter((task) => task.status?.toLowerCase() === "ongoing").length;
  const total = weekTasks.length;

  return {
    label: format(weekStart, "MMM d"),
    rangeLabel: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
    total,
    done,
    notDone: total - done,
    urgent,
    ongoing,
    completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export default function Reports() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      if (!user?.id) return;

      setLoading(true);

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, status, deadline, completed_at, subjects(name, color)")
        .eq("user_id", user.id);

      if (tasksError) {
        console.error("Error loading report tasks:", tasksError);
      } else {
        setTasks(tasksData || []);
      }

      const { data: logsData, error: logsError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (logsError) {
        console.error("Error loading activity logs:", logsError);
      } else {
        setActivityLogs(logsData || []);
      }

      setLoading(false);
    };

    loadReports();
  }, [user]);

  const weeklyReports = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), weekOptions);
    return Array.from({ length: 5 }, (_, index) =>
      summarizeWeek(tasks, subWeeks(currentWeekStart, 4 - index))
    );
  }, [tasks]);

  const currentWeek = weeklyReports[weeklyReports.length - 1] || {
    total: 0,
    done: 0,
    notDone: 0,
    urgent: 0,
    ongoing: 0,
    completionRate: 0,
  };

  const handleExportReportCsv = () => {
    downloadCsv("edash-weekly-report.csv", [
      ["Week", "Total", "Done", "Not Done", "Urgent", "Ongoing", "Completion Rate"],
      ...weeklyReports.map((week) => [
        week.rangeLabel,
        week.total,
        week.done,
        week.notDone,
        week.urgent,
        week.ongoing,
        `${week.completionRate}%`,
      ]),
    ]);
  };

  const handleExportLogsCsv = () => {
    downloadCsv("edash-activity-logs.csv", [
      ["Date", "Action", "Entity Type", "Entity ID", "Description"],
      ...activityLogs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm"),
        log.action,
        log.entity_type,
        log.entity_id || "",
        log.description,
      ]),
    ]);
  };

  return (
    <ReportsView
      loading={loading}
      currentWeek={currentWeek}
      weeklyReports={weeklyReports}
      activityLogs={activityLogs}
      onExportReportCsv={handleExportReportCsv}
      onExportLogsCsv={handleExportLogsCsv}
    />
  );
}
