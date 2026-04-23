import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ListChecks,
  Plus,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { format, parseISO, isAfter, isToday, differenceInDays, isPast } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { DatePicker } from "../components/ui/date-picker";
import { SelectField } from "../components/ui/SelectField";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const filters = ["All", "Urgent", "Ongoing", "Done"];

export default function Tasks() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [editingTask, setEditingTask] = useState(null); // State to hold the task being edited
  const [form, setForm] = useState({
    title: "",
    status: "Ongoing",
    subject_id: "",
    deadline: null,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;

      // Fetch tasks with subject names
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, status, deadline, subjects ( name, color )")
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
          color: task.subjects?.color,
        }));
        setTasks(formattedTasks);
      }

      // Fetch subjects for the dropdown
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
      const updatedTasks = tasks.map(task => {
        if (task.status === "Done" || !task.deadline) {
          return task;
        }

        const deadline = task.deadline;
        const diffDays = differenceInDays(deadline, today);
        let newStatus = task.status;

        if (isPast(deadline) && !isToday(deadline)) {
          newStatus = "Urgent";
        } else if (isToday(deadline) || (isAfter(deadline, today) && diffDays <= 2)) {
          newStatus = "Urgent";
        } else if (isAfter(deadline, today) && diffDays > 2) {
          newStatus = "Ongoing";
        }

        if (newStatus !== task.status) {
          updates.push(supabase.from("tasks").update({ status: newStatus.toLowerCase() }).eq("id", task.id));
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
  }, [tasks, user]);

  const visibleTasks = useMemo(() => {
    const filtered =
      activeFilter === "All"
        ? tasks
        : tasks.filter((task) => task.status === activeFilter);

    // Sort by status ("Done" tasks last), then by deadline
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

    const { data, error } = await supabase
      .from("tasks")
      .update({ status: newStatus.toLowerCase() })
      .eq("id", task.id)
      .select("*, subjects(name, color)")
      .single();

    if (error) {
      console.error("Error updating task status:", error);
      // Optionally show a message to the user
      return;
    }

    setTasks((current) =>
      current.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: newStatus,
            }
          : t
      )
    );
  };

  const handleCreateTaskWithNewSubject = async (taskTitle, subjectName, subjectColor) => {
    console.log("Attempting transactional insert...");

    const { data, error } = await supabase.rpc('create_task_with_new_subject', {
      task_title: taskTitle,
      new_subject_name: subjectName,
      new_subject_color: subjectColor
    });

    if (error) {
      console.error('Transaction failed:', error.message);
      // You can add logic here to show an error message to the user
    } else {
      console.log('Transaction successful! New task created with ID:', data);
      // To see the new data, you should refresh the task list from the database
      loadInitialData(); // Assuming loadInitialData is the function that fetches tasks
    }
  };

  const handleCreateTask = async () => {
    if (!form.title.trim() || !user) return;


    const taskPayload = {
      user_id: user.id,
      title: form.title.trim(),
      status: form.status.toLowerCase(),
      subject_id: form.subject_id || null,
      deadline: form.deadline,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([taskPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      setMessage("We couldn't save that task yet.");
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === form.subject_id);

    setTasks((current) => [
      ...current,
      {
        id: data.id,
        title: form.title.trim(),
        status: form.status,
        subject: selectedSubject?.name || "No subject",
        deadline: form.deadline,
        color: selectedSubject?.color,
      },
    ]);
    setForm({ title: "", status: "Ongoing", subject_id: "", deadline: null });
    setMessage("");
    setIsDialogOpen(false);
  };

  const handleUpdateTask = async () => {
    if (!form.title.trim() || !user || !editingTask) return;

    const taskPayload = {
      title: form.title.trim(),
      status: form.status.toLowerCase(),
      subject_id: form.subject_id || null,
      deadline: form.deadline,
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
              color: data.subjects?.color,
            }
          : task
      )
    );

    closeDialog();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      alert("Could not delete the task.");
    } else {
      setTasks((current) => current.filter((task) => task.id !== taskId));
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      status: task.status,
      subject_id: subjects.find((s) => s.name === task.subject)?.id || "",
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
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-[22px] border border-[#ddd4c3] bg-[#f8f5ef] p-1 shadow-[0_12px_28px_rgba(127,117,96,0.1)]">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "rounded-[18px] px-6 py-3 text-xl font-medium transition-colors",
                activeFilter === filter
                  ? "bg-[#f2eee6] text-[#354737]"
                  : "text-[#5e6f5d] hover:bg-[#f4f0e7]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <Button
          variant="icon"
          className="h-12 w-12"
          onClick={openNewDialog}
          aria-label="Add task"
        >
          <Plus size={22} />
        </Button>
      </section>

      <Card className="flex min-h-[270px] flex-col items-center justify-center border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-8 text-center shadow-none">
        {visibleTasks.length === 0 ? (
          <>
            <ListChecks size={54} className="text-[#afb4a8]" />
            <p className="mt-5 text-2xl text-[#6e7c69]">No tasks yet. Add one to get started.</p>
          </>
        ) : (
          <div className="mt-6 w-full space-y-3 text-left">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors",
                  task.status === "Done" && "opacity-60"
                )}
                style={{
                  borderLeft: `5px solid ${task.color || "transparent"}`,
                  backgroundColor:
                    task.status === "Urgent"
                      ? "#fee2e2" // light red
                      : task.status === "Ongoing"
                      ? "#f5cda2" // light orange
                      : task.status === "Done"
                      ? "#dcfce7" // light green
                      : "#fbf9f4", // default
                }}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={task.status === "Done"}
                    onCheckedChange={() => handleToggleTaskStatus(task)}
                    aria-label="Mark task as done"
                  />
                  <div>
                    <p
                      className={cn(
                        "text-xl font-semibold text-[#354737]",
                        task.status === "Done" && "line-through"
                      )}
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 text-sm uppercase tracking-[0.12em] text-[#7a8a77]">
                      {task.subject}
                    </p>
                    {task.deadline && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        Due {format(task.deadline, "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
                    task.status === "Done" && "hidden"
                  )}
                >
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(task)}>
                    <Edit size={18} className="text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 size={18} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog
        open={isDialogOpen}
        title={editingTask ? "Edit Task" : "New Task"}
        onClose={closeDialog}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xl font-medium text-[#354737]">
              Task Title
            </label>
            <Input
              placeholder="e.g. Read chapter 4"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-4">
            <SelectField
              label="Subject (Optional)"
              value={form.subject_id}
              onChange={(value) =>
                setForm((current) => ({ ...current, subject_id: value }))
              }
            >
              <option value="">No subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label className="mb-2 block text-xl font-medium text-[#354737]">
              Deadline (Optional)
            </label>
            <DatePicker
              value={form.deadline}
              onChange={(date) =>
                setForm((current) => ({ ...current, deadline: date }))
              }
            />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingTask ? "Save Changes" : "Create Task"}</Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}