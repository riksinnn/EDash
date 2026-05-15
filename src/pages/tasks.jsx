import { useEffect, useMemo, useState } from "react";
import { differenceInDays, isAfter, isPast, isToday, parseISO } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { recordActivity } from "../lib/activityLog";
import { supabase } from "../lib/supabase";
import TasksView from "../views/tasks/TasksView";

const filters = ["All", "Urgent", "Ongoing", "Done"];

export default function Tasks() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    status: "Ongoing",
    subject_id: "",
    deadline: null,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, status, deadline, completed_at, subjects ( name, color )")
        .eq("user_id", user.id);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
      } else if (tasksData) {
        const formattedTasks = tasksData.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status
            ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
            : "Ongoing",
          subject: task.subjects?.name || "No subject",
          deadline: task.deadline ? parseISO(task.deadline) : null,
          completed_at: task.completed_at,
          color: task.subjects?.color,
        }));
        setTasks(formattedTasks);
      }

      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, color")
        .eq("user_id", user.id)
        .order("name");

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
      } else {
        setSubjects(subjectsData);
      }
    };

    loadInitialData();
  }, [user]);

  useEffect(() => {
    const updateTaskStatuses = async () => {
      const today = new Date();
      const updates = [];
      const updatedTasks = tasks.map((task) => {
        if (task.status === "Done" || !task.deadline) {
          return task;
        }

        const diffDays = differenceInDays(task.deadline, today);
        let newStatus = task.status;

        if (isPast(task.deadline) && !isToday(task.deadline)) {
          newStatus = "Urgent";
        } else if (isToday(task.deadline) || (isAfter(task.deadline, today) && diffDays <= 2)) {
          newStatus = "Urgent";
        } else if (isAfter(task.deadline, today) && diffDays > 2) {
          newStatus = "Ongoing";
        }

        if (newStatus !== task.status) {
          updates.push(
            supabase.from("tasks").update({ status: newStatus.toLowerCase() }).eq("id", task.id)
          );
          return { ...task, status: newStatus };
        }

        return task;
      });

      if (updates.length > 0) {
        await Promise.all(updates);
        setTasks(updatedTasks);
      }
    };

    if (tasks.length > 0) {
      updateTaskStatuses();
    }
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const filtered =
      activeFilter === "All" ? tasks : tasks.filter((task) => task.status === activeFilter);

    return filtered.sort((a, b) => {
      if (a.status === "Done" && b.status !== "Done") return 1;
      if (a.status !== "Done" && b.status === "Done") return -1;
      if (a.deadline && b.deadline) return a.deadline - b.deadline;
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    });
  }, [activeFilter, tasks]);

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === "Done" ? "Ongoing" : "Done";

    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus.toLowerCase(),
        completed_at: newStatus === "Done" ? new Date().toISOString() : null,
      })
      .eq("id", task.id)
      .select("*, subjects(name, color)")
      .single();

    if (error) {
      console.error("Error updating task status:", error);
      return;
    }

    setTasks((current) =>
      current.map((entry) =>
        entry.id === task.id
          ? {
              ...entry,
              status: newStatus,
              completed_at: newStatus === "Done" ? new Date().toISOString() : null,
            }
          : entry
      )
    );

    await recordActivity({
      userId: user?.id,
      action: newStatus === "Done" ? "completed" : "reopened",
      entityType: "task",
      entityId: task.id,
      description: `${newStatus === "Done" ? "Completed" : "Reopened"} task ${task.title}`,
      metadata: { title: task.title, status: newStatus.toLowerCase() },
    });
  };

  const handleCreateTask = async () => {
    if (!form.title.trim() || !user) return;

    if (isSaving) return;
    setIsSaving(true);

    const taskPayload = {
      user_id: user.id,
      title: form.title.trim(),
      status: form.status.toLowerCase(),
      subject_id: form.subject_id || null,
      deadline: form.deadline,
      completed_at: form.status === "Done" ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([taskPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      setMessage("We couldn't save that task yet.");
      setIsSaving(false);
      return;
    }

    const selectedSubject = subjects.find((subject) => subject.id === form.subject_id);

    setTasks((current) => [
      ...current,
      {
        id: data.id,
        title: form.title.trim(),
        status: form.status,
        subject: selectedSubject?.name || "No subject",
        deadline: form.deadline,
        completed_at: taskPayload.completed_at,
        color: selectedSubject?.color,
      },
    ]);
    setForm({ title: "", status: "Ongoing", subject_id: "", deadline: null });
    setMessage("");
    setIsDialogOpen(false);
    setIsSaving(false);

    await recordActivity({
      userId: user.id,
      action: "created",
      entityType: "task",
      entityId: data.id,
      description: `Created task ${form.title.trim()}`,
      metadata: { title: form.title.trim(), subject: selectedSubject?.name || null },
    });
  };

  const handleUpdateTask = async () => {
    if (!form.title.trim() || !user || !editingTask) return;

    if (isSaving) return;
    setIsSaving(true);

    const taskPayload = {
      title: form.title.trim(),
      status: form.status.toLowerCase(),
      subject_id: form.subject_id || null,
      deadline: form.deadline,
      completed_at: form.status === "Done" ? editingTask.completed_at || new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(taskPayload)
      .eq("id", editingTask.id)
      .select("*, subjects(name, color)")
      .single();

    if (error) {
      console.error("Error updating task:", error);
      setMessage("We couldn't update that task yet.");
      setIsSaving(false);
      return;
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === editingTask.id
          ? {
              id: data.id,
              title: data.title,
              status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
              subject: data.subjects?.name || "No subject",
              deadline: data.deadline ? parseISO(data.deadline) : null,
              completed_at: data.completed_at,
              color: data.subjects?.color,
            }
          : task
      )
    );

    setIsSaving(false);
    closeDialog();

    await recordActivity({
      userId: user.id,
      action: "updated",
      entityType: "task",
      entityId: data.id,
      description: `Updated task ${data.title}`,
      metadata: { title: data.title, status: data.status },
    });
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      alert("Could not delete the task.");
    } else {
      const deletedTask = tasks.find((task) => task.id === taskId);
      await recordActivity({
        userId: user?.id,
        action: "deleted",
        entityType: "task",
        entityId: taskId,
        description: `Deleted task ${deletedTask?.title || "Untitled task"}`,
        metadata: { title: deletedTask?.title || null },
      });
      setTasks((current) => current.filter((task) => task.id !== taskId));
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      status: task.status,
      subject_id: subjects.find((subject) => subject.name === task.subject)?.id || "",
      deadline: task.deadline,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingTask(null);
    setForm({ title: "", status: "Ongoing", subject_id: "", deadline: null });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setMessage("");
    setForm({ title: "", status: "Ongoing", subject_id: "", deadline: null });
  };

  const handleSave = () => {
    if (editingTask) {
      handleUpdateTask();
    } else {
      handleCreateTask();
    }
  };

  return (
    <TasksView
      activeFilter={activeFilter}
      filters={filters}
      visibleTasks={visibleTasks}
      isDialogOpen={isDialogOpen}
      editingTask={editingTask}
      form={form}
      subjects={subjects}
      message={message}
      isSaving={isSaving}
      onFilterChange={setActiveFilter}
      onOpenNewDialog={openNewDialog}
      onCloseDialog={closeDialog}
      onTitleChange={(value) => setForm((current) => ({ ...current, title: value }))}
      onSubjectChange={(value) => setForm((current) => ({ ...current, subject_id: value }))}
      onDeadlineChange={(date) => setForm((current) => ({ ...current, deadline: date }))}
      onSave={handleSave}
      onToggleTaskStatus={handleToggleTaskStatus}
      onEditTask={openEditDialog}
      onDeleteTask={handleDeleteTask}
    />
  );
}
