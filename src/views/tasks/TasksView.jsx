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
    <div className="space-y-5 sm:space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full grid-cols-4 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-1 sm:inline-flex sm:w-auto sm:rounded-[22px]">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onFilterChange(filter)}
                  className={cn(
                    "min-w-0 rounded-[14px] px-2 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer sm:rounded-[18px] sm:px-6 sm:py-3 sm:text-xl",
                    activeFilter === filter
                      // Active State: Crisp cream/green in light mode, clean deep gray/white in dark mode
                      ? "bg-[#f2eee6] text-[#354737] shadow-sm dark:bg-[var(--app-panel)] dark:text-[var(--text-primary)]"
                      // Inactive State: Uses token variables so they shift automatically across modes
                      : "text-[var(--text-secondary)] hover:bg-[#f4f0e7] hover:text-[var(--text-primary)] dark:hover:bg-[var(--app-panel)]/50"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>

        <Button
          variant="icon"
          className="h-12 w-12 self-end sm:self-auto"
          onClick={onOpenNewDialog}
          aria-label="Add task"
        >
          <Plus size={22} />
        </Button>
      </section>

      <Card className="flex min-h-[270px] flex-col items-center justify-center border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_92%,transparent)] p-4 shadow-none sm:p-7">
        {visibleTasks.length === 0 ? (
          <>
            <ListChecks size={46} className="text-[#afb4a8] sm:size-[54px]" />
            <p className="mt-5 max-w-[18rem] text-center text-xl leading-snug text-[#6e7c69] sm:max-w-none sm:text-2xl">
              No tasks yet. Add one to get started.
            </p>
          </>
        ) : (
          <div className="mt-6 w-full space-y-3 text-left">
            {visibleTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-start justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] px-3 py-3 transition-all duration-200 hover:scale-[1.01] hover:shadow-md sm:items-center sm:px-4",
                  task.status === "Done" && "opacity-60"
                )}
                style={{
                  borderLeft: `5px solid ${task.color || "transparent"}`,
                  backgroundColor: "var(--app-panel)",
                }}
              >
                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                  <Checkbox
                    checked={task.status === "Done"}
                    onCheckedChange={() => onToggleTaskStatus(task)}
                    aria-label="Mark task as done"
                  />
                  <div className="min-w-0 space-y-2">
                    <p
                      className={cn(
                        "break-words text-lg font-semibold text-[var(--text-primary)] sm:text-xl",
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
