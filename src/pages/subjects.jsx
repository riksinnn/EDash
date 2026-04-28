import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    room: "",
    color: "#8cae8a",
  });

  useEffect(() => {
    if (user) {
      loadSubjects();

      const channel = supabase.channel("subjects-channel");
      channel
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "subjects", filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setSubjects((current) => {
                // Prevent duplicates from race conditions
                if (current.some((s) => s.id === payload.new.id)) {
                  return current;
                }
                return [...current, payload.new].sort((a, b) => a.name.localeCompare(b.name));
              });
            } else if (payload.eventType === "UPDATE") {
              setSubjects((current) =>
                current.map((s) => (s.id === payload.new.id ? payload.new : s))
              );
            } else if (payload.eventType === "DELETE") {
              setSubjects((current) =>
                current.filter((s) => s.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadSubjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) throw error;
      if (data) setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      setMessage("Could not load subjects.");
    } finally {
      setLoading(false);
    }
  };

  // CREATE - Add new subject
  const handleCreateSubject = async () => {
    if (!form.name.trim() || !user) return;

    const { error } = await supabase.rpc("create_subject_for_user", {
      name: form.name.trim(),
      room: form.room.trim() || null,
      color: form.color,
    });

    if (error) {
      console.error("Error creating subject:", error);
      setMessage("We couldn't save that subject yet. Please try again.");
      return;
    }

    setForm({ name: "", room: "", color: "#8cae8a" });
    setMessage("");
    setIsDialogOpen(false);
  };

  // UPDATE - Open edit dialog with subject data
  const handleOpenEdit = (subject) => {
    setSelectedSubject(subject);
    setForm({
      name: subject.name,
      room: subject.room || "",
      color: subject.color,
    });
    setIsEditDialogOpen(true);
  };

  // UPDATE - Save edited subject
  const handleUpdateSubject = async () => {
    if (!form.name.trim() || !selectedSubject) return;

    const { error } = await supabase
      .from("subjects")
      .update({
        name: form.name.trim(),
        room: form.room.trim() || null,
        color: form.color,
      })
      .eq("id", selectedSubject.id);

    if (error) {
      console.error(error);
      setMessage("We couldn't update that subject.");
      return;
    }

    setSelectedSubject(null);
    setForm({ name: "", room: "", color: "#8cae8a" });
    setIsEditDialogOpen(false);
  };

  // DELETE - Open delete confirmation
  const handleOpenDelete = (subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  // DELETE - Confirm and delete subject
  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", selectedSubject.id);

    if (error) {
      console.error(error);
      setMessage("We couldn't delete that subject.");
      return;
    }
    setSubjects((current) =>
      current.filter((s) => s.id !== selectedSubject.id)
    );
    setSelectedSubject(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-5xl font-semibold text-[#283728]">
          Your Subjects
        </h2>
        <Button
          variant="icon"
          className="h-12 w-12"
          onClick={() => setIsDialogOpen(true)}
          aria-label="Add subject"
        >
          <Plus size={22} />
        </Button>
      </section>

      <Card className="min-h-[240px] border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-7 shadow-none">
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
                {/* Action buttons - visible on hover */}
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(subject)}
                    className="rounded-xl bg-[#e8f0e4] p-2 text-[#5a7a52] transition-colors hover:bg-[#d4e4ce]"
                    aria-label={`Edit ${subject.name}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(subject)}
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

      <AlertDialog
        open={isDialogOpen}
        title="New Subject"
        onClose={() => setIsDialogOpen(false)}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xl font-medium text-[#354737]">
              Subject Name
            </label>
            <Input
              placeholder="e.g. Advanced Mathematics"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
            <div>
              <label className="mb-2 block text-xl font-medium text-[#354737]">
                Room
              </label>
              <Input
                placeholder="e.g. Hall 4"
                value={form.room}
                onChange={(event) =>
                  setForm((current) => ({ ...current, room: event.target.value }))
                }
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-xl font-medium text-[#354737]">Color</span>
              <span className="flex h-[54px] items-center rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-2 shadow-[0_5px_18px_rgba(75,84,63,0.08)]">
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                  className="h-8 w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
                />
              </span>
            </label>
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubject} disabled={!form.name.trim()}>
              Create
            </Button>
          </div>
        </div>
      </AlertDialog>

      {/* Edit Subject Dialog */}
      <AlertDialog
        open={isEditDialogOpen}
        title="Edit Subject"
        onClose={() => setIsEditDialogOpen(false)}
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xl font-medium text-[#354737]">
              Subject Name
            </label>
            <Input
              placeholder="e.g. Advanced Mathematics"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
            <div>
              <label className="mb-2 block text-xl font-medium text-[#354737]">
                Room
              </label>
              <Input
                placeholder="e.g. Hall 4"
                value={form.room}
                onChange={(event) =>
                  setForm((current) => ({ ...current, room: event.target.value }))
                }
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-xl font-medium text-[#354737]">Color</span>
              <span className="flex h-[54px] items-center rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-2 shadow-[0_5px_18px_rgba(75,84,63,0.08)]">
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                  className="h-8 w-full cursor-pointer appearance-none border-0 bg-transparent p-0"
                />
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubject} disabled={!form.name.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        title="Delete Subject"
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-lg text-[#6e7c69]">
            Are you sure you want to delete <strong>{selectedSubject?.name}</strong>?
          </p>

          <p className="text-sm text-red-600">
            All tasks and schedules under this subject will also be permanently deleted.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSubject}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}