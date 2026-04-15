import { useMemo, useState } from "react";
import { ChevronDown, ListChecks, Plus } from "lucide-react";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const filters = ["All", "Urgent", "Ongoing", "Done"];

export default function Tasks() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    status: "Ongoing",
    subject: "No subject",
  });

  const visibleTasks = useMemo(() => {
    if (activeFilter === "All") return tasks;
    return tasks.filter((task) => task.status === activeFilter);
  }, [activeFilter, tasks]);

  const handleCreateTask = async () => {
    if (!form.title.trim() || !user) return;

    const taskPayload = {
      user_id: user.uid,
      title: form.title.trim(),
      status: form.status.toLowerCase(),
      subject_id: null,
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

    setTasks((current) => [
      ...current,
      {
        id: data?.id ?? crypto.randomUUID(),
        title: form.title.trim(),
        status: form.status,
        subject: form.subject,
      },
    ]);
    setForm({ title: "", status: "Ongoing", subject: "No subject" });
    setMessage("");
    setIsDialogOpen(false);
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
              className={[
                "rounded-[18px] px-6 py-3 text-xl font-medium transition-colors",
                activeFilter === filter
                  ? "bg-[#f2eee6] text-[#354737]"
                  : "text-[#5e6f5d] hover:bg-[#f4f0e7]",
              ].join(" ")}
            >
              {filter}
            </button>
          ))}
        </div>

        <Button
          variant="icon"
          className="h-12 w-12"
          onClick={() => setIsDialogOpen(true)}
          aria-label="Add task"
        >
          <Plus size={22} />
        </Button>
      </section>

      <Card className="flex min-h-[270px] flex-col items-center justify-center border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-8 text-center shadow-none">
        <ListChecks size={54} className="text-[#afb4a8]" />
        {visibleTasks.length === 0 ? (
          <p className="mt-5 text-2xl text-[#6e7c69]">No tasks yet. Add one to get started.</p>
        ) : (
          <div className="mt-6 w-full space-y-3 text-left">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-[#ddd4c3] bg-[#fbf9f4] px-4 py-3"
              >
                <p className="text-xl font-semibold text-[#354737]">{task.title}</p>
                <p className="mt-1 text-sm uppercase tracking-[0.12em] text-[#7a8a77]">
                  {task.status} • {task.subject}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog
        open={isDialogOpen}
        title="New Task"
        onClose={() => setIsDialogOpen(false)}
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
              options={["Ongoing", "Urgent", "Done"]}
            />
            <SelectField
              label="Subject (Optional)"
              value={form.subject}
              onChange={(value) =>
                setForm((current) => ({ ...current, subject: value }))
              }
              options={["No subject", "Advanced Mathematics", "History", "Science"]}
            />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xl font-medium text-[#354737]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-4 py-3 pr-11 text-xl text-[#425642] shadow-[0_5px_18px_rgba(75,84,63,0.08)] outline-none focus:border-[#89a171]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7e8c7a]"
        />
      </span>
    </label>
  );
}
