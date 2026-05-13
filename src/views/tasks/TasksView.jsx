import { Calendar, Edit, ListChecks, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "../../components/ui/checkbox";
import { AlertDialog } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { DatePicker } from "../../components/ui/date-picker";
import { SelectField } from "../../components/ui/SelectField";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function TasksView({
  activeFilter,
  filters,
  visibleTasks,
  isDialogOpen,
  editingTask,
  form,
  subjects,
  message,
  isSaving,
  onFilterChange,
  onOpenNewDialog,
  onCloseDialog,
  onTitleChange,
  onSubjectChange,
  onDeadlineChange,
  onSave,
  onToggleTaskStatus,
  onEditTask,
  onDeleteTask,
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-[22px] border-[var(--app-border)] bg-[var(--app-panel-soft)] p-1 shadow-[0_12px_28px_rgba(127,117,96,0.1)]">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
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
          onClick={onOpenNewDialog}
          aria-label="Add task"
        >
          <Plus size={22} />
        </Button>
      </section>

      <Card className="min-h-[260px] border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_92%,transparent)] p-7 shadow-none flex min-h-[270px] flex-col items-center justify-center">
        {visibleTasks.length === 0 ? (
          <>
            <ListChecks size={54} className="text-[#afb4a8]" />
            <p className="mt-5 text-2xl text-[#6e7c69]">
              No tasks yet. Add one to get started.
            </p>
          </>
        ) : (
          <div className="mt-6 w-full space-y-3 text-left">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-3 transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
                  task.status === "Done" && "opacity-60"
                )}
                style={{
                  borderLeft: `5px solid ${task.color || "transparent"}`,
                  backgroundColor: "var(--app-panel)",
                }}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={task.status === "Done"}
                    onCheckedChange={() => onToggleTaskStatus(task)}
                    aria-label="Mark task as done"
                  />
                  <div className="space-y-2">
                    <p
                      className={cn(
                        "text-xl font-semibold text-[var(--text-primary)]",
                        task.status === "Done" && "line-through"
                      )}
                    >
                      {task.title}
                    </p>

                    <div className="mt-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                          task.status === "Urgent" &&
                            "bg-[var(--urgent-bg)] text-[var(--urgent-text)] uppercase",
                          task.status === "Ongoing" &&
                            "bg-[var(--ongoing-bg)] text-[var(--ongoing-text)] uppercase",
                          task.status === "Done" &&
                            "bg-[var(--done-bg)] text-[var(--done-text)] uppercase"
                        )}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {task.subject}
                    </p>
                    {task.deadline ? (
                      <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Calendar size={14} />
                        Due {format(task.deadline, "MMM d, yyyy")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
                    task.status === "Done" && "hidden"
                  )}
                >
                  <Button variant="ghost" size="icon" onClick={() => onEditTask(task)}>
                    <Edit size={18} className="text-[var(--text-muted)]" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)}>
                    <Trash2 size={18} className="text-[var(--text-muted)]" />
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
        onClose={onCloseDialog}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xl font-medium text-[var(--text-secondary)]">
              Task Title
            </label>
            <Input
              placeholder="e.g. Read chapter 4"
              value={form.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>

          <div className="grid gap-4">
            <SelectField label="Subject" value={form.subject_id} onChange={onSubjectChange}>
              <option value="">No subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label className="mb-2 block text-xl font-medium text-[var(--text-secondary)]">
              Deadline (Optional)
            </label>
            <DatePicker value={form.deadline} onChange={onDeadlineChange} />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCloseDialog}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving
                ? editingTask
                  ? "Saving..."
                  : "Creating..."
                : editingTask
                  ? "Save Changes"
                  : "Create Task"}
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
