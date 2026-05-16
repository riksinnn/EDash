import { RefreshCw, Plus, Edit, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertDialog } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { SelectField } from "../../components/ui/SelectField";
import { TimeScrollPicker } from "../../components/ui/TimeScrollPicker";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ScheduleView({
  days,
  selectedDay,
  onSelectedDayChange,
  onOpenNewDialog,
  onOpenGoogleSyncConfirm,
  onGoogleSyncConfirmClose,
  onSyncGoogleCalendar,
  dayEntries,
  formatTime,
  onOpenEditDialog,
  onOpenDeleteDialog,
  isDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isNoSubjectsOpen,
  subjects,
  form,
  errorMessage,
  successMessage,
  isSaving,
  isSyncingCalendar,
  isGoogleSyncConfirmOpen,
  deleteAllDays,
  onDialogClose,
  onEditDialogClose,
  onDeleteDialogClose,
  onNoSubjectsClose,
  onFormSubjectChange,
  onFormDayToggle,
  onFormStartTimeChange,
  onFormEndTimeChange,
  onScheduleSubmit,
  onUpdateSubmit,
  onDeleteSubmit,
  onDeleteAllDaysChange,
  onGoToSubjects,
}) {
  return (
    <div className="space-y-5 sm:space-y-7">
      {(errorMessage || successMessage) ? (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-white shadow transition-all duration-300 ${
            errorMessage ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {errorMessage || successMessage}
        </div>
      ) : null}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {days.map((day) => {
            const isActive = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => onSelectedDayChange(day)}
                className={[
                  "flex h-14 min-w-14 flex-col items-center justify-center rounded-[18px] border px-3 py-2 text-base font-medium transition-colors sm:h-18 sm:min-w-16 sm:rounded-[20px] sm:px-4 sm:py-3 sm:text-xl",
                  isActive
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--app-panel)]"
                    : "border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--text-secondary)]",
                ].join(" ")}
              >
                <span>{day}</span>
                <span className={isActive ? "mt-1 text-base opacity-70" : "hidden"}>.</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="h-12 gap-2"
            onClick={onOpenGoogleSyncConfirm}
            disabled={isSyncingCalendar}
          >
            <RefreshCw size={18} className={isSyncingCalendar ? "animate-spin" : ""} />
            {isSyncingCalendar ? "Syncing..." : "Sync Google"}
          </Button>
          <Button variant="icon" className="h-12 w-12" onClick={onOpenNewDialog} aria-label="Schedule class">
            <Plus size={22} />
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">
          {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}&apos;s Classes
        </h2>

        <Card className="min-h-[240px] border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_92%,transparent)] p-4 shadow-none sm:min-h-[260px] sm:p-7">
          {dayEntries.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center text-center text-xl text-[var(--text-secondary)] sm:min-h-[200px] sm:text-2xl">
              Nothing scheduled for this day yet.
            </div>
          ) : (
            <div className="space-y-4">
              {dayEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="group flex items-start justify-between gap-3 rounded-3xl border p-4 transition-all sm:items-center sm:p-5"
                  style={{
                    borderLeft: `5px solid ${entry.color || "transparent"}`,
                  }}
                >
                  <div>
                    <p className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                      {entry.subject}
                    </p>
                    <p className="mt-2 text-lg text-[var(--text-muted)]">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                    </p>
                    <p className="mt-1 text-base text-[var(--text-secondary)]">
                      {entry.teacher || "Teacher not set"}
                      {entry.room ? ` - ${entry.room}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => onOpenEditDialog(entry)}>
                      <Edit size={20} className="text-[var(--text-muted)]" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onOpenDeleteDialog(entry)}>
                      <Trash2 size={20} className="text-[var(--text-muted)]" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>

      <AlertDialog open={isDialogOpen} title="Schedule Class" onClose={onDialogClose}>
        <div className="max-h-[80vh] space-y-6 overflow-y-auto pr-1 ">
          {subjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4 text-sm text-[var(--text-secondary)]">
              No subjects yet. Add your first subject first before scheduling a class.
            </div>
          ) : null}

          <SelectField label="Subject" value={form.subject_id} onChange={onFormSubjectChange}>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </SelectField>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Days</label>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-[var(--app-panel-soft)] p-2 sm:grid-cols-7">
              {days.map((day) => {
                const isSelected = form.days?.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onFormDayToggle(day)}
                    className={cn(
                      "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-[var(--text-primary)] text-[var(--app-panel)] shadow-sm"
                        : "bg-[var(--app-panel)] text-[var(--text-secondary)] hover:bg-[var(--hover-soft)]"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeScrollPicker
              key={`start-${form.start_time}-${form.days}`}
              label="Start Time"
              value={form.start_time}
              onChange={onFormStartTimeChange}
            />
            <TimeScrollPicker
              key={`end-${form.end_time}-${form.days}`}
              label="End Time"
              value={form.end_time}
              onChange={onFormEndTimeChange}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onDialogClose}>
              Cancel
            </Button>
            <Button onClick={onScheduleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Schedule"}
            </Button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog open={isEditDialogOpen} title="Edit Class" onClose={onEditDialogClose}>
        <div className="max-h-[80vh] space-y-6 overflow-y-auto pr-1">
          <SelectField
            label="Subject"
            value={String(form.subject_id || "")}
            onChange={onFormSubjectChange}
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </SelectField>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Days</label>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-[var(--app-panel-soft)] p-2 sm:grid-cols-7">
              {days.map((day) => {
                const isSelected = form.days?.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onFormDayToggle(day)}
                    className={cn(
                      "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-[var(--text-primary)] text-[var(--app-panel)] shadow-sm"
                        : "bg-[var(--app-panel)] text-[var(--text-secondary)] hover:bg-[var(--hover-soft)]"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeScrollPicker
              key={`start-${form.start_time}-${form.days}`}
              label="Start Time"
              value={form.start_time}
              onChange={onFormStartTimeChange}
            />
            <TimeScrollPicker
              key={`end-${form.end_time}-${form.days}`}
              label="End Time"
              value={form.end_time}
              onChange={onFormEndTimeChange}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onEditDialogClose}>
              Cancel
            </Button>
            <Button onClick={onUpdateSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} title="Delete Class" onClose={onDeleteDialogClose}>
        <div className="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
          <p className="text-lg text-[var(--text-secondary)]">
            {deleteAllDays
              ? "This will delete all scheduled days for this class."
              : "This will delete only this day's schedule."}
          </p>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={deleteAllDays}
              onChange={(event) => onDeleteAllDaysChange(event.target.checked)}
            />
            <label className="text-sm text-[var(--text-secondary)]">
              Delete all days for this class
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onDeleteDialogClose}>
              Cancel
            </Button>
            <Button onClick={onDeleteSubmit} disabled={isSaving} className="bg-red-600 text-white hover:bg-red-700">
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog open={isNoSubjectsOpen} title="No Subjects Yet" onClose={onNoSubjectsClose}>
        <div className="space-y-5">
          <p className="text-[var(--text-secondary)]">
            Add your first subject before scheduling a class.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onNoSubjectsClose}>
              Cancel
            </Button>
            <Button onClick={onGoToSubjects}>Go to Subjects</Button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog
        open={isGoogleSyncConfirmOpen}
        title="Sync Google Calendar?"
        onClose={onGoogleSyncConfirmClose}
      >
        <div className="space-y-5">
          <p className="text-lg text-[var(--text-secondary)]">
            EDash will ask Google for read-only calendar access, then import upcoming timed events
            as class schedule blocks. Nothing syncs unless you continue.
          </p>

          <p className="text-sm text-[var(--text-muted)]">
            Existing matching classes will be skipped to avoid duplicates.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onGoogleSyncConfirmClose}>
              Cancel
            </Button>
            <Button onClick={onSyncGoogleCalendar} disabled={isSyncingCalendar}>
              {isSyncingCalendar ? "Syncing..." : "Continue"}
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
