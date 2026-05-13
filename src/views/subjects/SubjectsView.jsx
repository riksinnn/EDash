import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { AlertDialog } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

export default function SubjectsView({
  subjects,
  loading,
  isDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedSubject,
  message,
  form,
  onOpenNew,
  onOpenEdit,
  onOpenDelete,
  onDialogClose,
  onEditDialogClose,
  onDeleteDialogClose,
  onFormChange,
  onCreate,
  onUpdate,
  onDelete,
}) {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-5xl font-semibold text-[var(--accent)]">
          Your Subjects
        </h2>
        <Button variant="icon" className="h-12 w-12" onClick={onOpenNew} aria-label="Add subject">
          <Plus size={22} />
        </Button>
      </section>

      <Card className="min-h-[260px] border-dashed border-[#354637]/50 bg-[#354637] p-7 shadow-none">
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <p className="text-2xl text-[#6e7c69]">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <BookOpen size={48} className="text-[#aab1a3]" />
            <p className="mt-4 text-2xl text-[#6e7c69]">
              No subjects yet. Add one to start organizing classes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group relative rounded-[24px] border border-[#ddd4c3] bg-[#fbf9f4] p-5"
              >
                <div
                  className="mb-4 h-3 w-16 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <p className="text-2xl font-semibold text-[#354737]">{subject.name}</p>
                <p className="mt-1 text-lg text-[#6e7c69]">
                  {subject.room || "Room not set"}
                </p>
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onOpenEdit(subject)}
                    className="rounded-xl bg-[#e8f0e4] p-2 text-[#5a7a52] transition-colors hover:bg-[#d4e4ce]"
                    aria-label={`Edit ${subject.name}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDelete(subject)}
                    className="rounded-xl bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                    aria-label={`Delete ${subject.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AlertDialog open={isDialogOpen} title="New Subject" onClose={onDialogClose}>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xl font-medium text-[#354737]">
              Subject Name
            </label>
            <Input
              placeholder="e.g. Advanced Mathematics"
              value={form.name}
              onChange={(event) => onFormChange("name", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
            <div>
              <label className="mb-2 block text-xl font-medium text-[#354737]">Room</label>
              <Input
                placeholder="e.g. Hall 4"
                value={form.room}
                onChange={(event) => onFormChange("room", event.target.value)}
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-xl font-medium text-[#354737]">Color</span>
              <span className="flex h-[54px] items-center rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-2 shadow-[0_5px_18px_rgba(75,84,63,0.08)]">
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) => onFormChange("color", event.target.value)}
                  className="h-8 w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
                />
              </span>
            </label>
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onDialogClose}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={!form.name.trim()}>
              Create
            </Button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog open={isEditDialogOpen} title="Edit Subject" onClose={onEditDialogClose}>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xl font-medium text-[#354737]">
              Subject Name
            </label>
            <Input
              placeholder="e.g. Advanced Mathematics"
              value={form.name}
              onChange={(event) => onFormChange("name", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
            <div>
              <label className="mb-2 block text-xl font-medium text-[#354737]">Room</label>
              <Input
                placeholder="e.g. Hall 4"
                value={form.room}
                onChange={(event) => onFormChange("room", event.target.value)}
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-xl font-medium text-[#354737]">Color</span>
              <span className="flex h-[54px] items-center rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-2 shadow-[0_5px_18px_rgba(75,84,63,0.08)]">
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) => onFormChange("color", event.target.value)}
                  className="h-8 w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
                />
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onEditDialogClose}>
              Cancel
            </Button>
            <Button onClick={onUpdate} disabled={!form.name.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} title="Delete Subject" onClose={onDeleteDialogClose}>
        <div className="space-y-4">
          <p className="text-lg text-[#6e7c69]">
            Are you sure you want to delete <strong>{selectedSubject?.name}</strong>?
          </p>

          <p className="text-sm text-red-600">
            All tasks and schedules under this subject will also be permanently deleted.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onDeleteDialogClose}>
              Cancel
            </Button>
            <Button onClick={onDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
