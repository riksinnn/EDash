import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ListChecks, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
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
        .select("id, title, status, deadline, subjects ( name )")
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
        }));
        setTasks(formattedTasks);
      }

      // Fetch subjects for the dropdown
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name")
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

  const visibleTasks = useMemo(() => {
    const filtered = activeFilter === "All" 
      ? tasks 
      : tasks.filter((task) => task.status === activeFilter);

    // Sort by deadline, nulls last
    return filtered.sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline - b.deadline;
      if (a.deadline) return -1; // a has deadline, b doesn't
      if (b.deadline) return 1;  // b has deadline, a doesn't
      return 0; // both are null
    });
  }, [activeFilter, tasks]);

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
      .select("*, subjects(name)")
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
                className="group flex items-center justify-between rounded-2xl border border-[#ddd4c3] bg-[#fbf9f4] px-4 py-3 transition-colors hover:border-gray-300"
              >
                <div>
                  <p className="text-xl font-semibold text-[#354737]">{task.title}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.12em] text-[#7a8a77]">
                    {task.status} • {task.subject}
                  </p>
                  {task.deadline && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      Due {format(task.deadline, "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Status"
              value={form.status}
              onChange={(value) =>
                setForm((current) => ({ ...current, status: value }))
              }
            >
              {["Ongoing", "Urgent", "Done"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
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