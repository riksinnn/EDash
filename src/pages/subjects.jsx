import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
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
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    room: "",
    color: "#8cae8a",
  });

  const handleCreateSubject = async () => {
    if (!form.name.trim() || !user) return;

    const subjectPayload = {
      user_id: user.uid,
      name: form.name.trim(),
      room: form.room.trim() || null,
      color: form.color,
    };

    const { data, error } = await supabase
      .from("subjects")
      .insert([subjectPayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      setMessage("We couldn't save that subject yet.");
      return;
    }

    setSubjects((current) => [
      ...current,
      {
        id: data?.id ?? crypto.randomUUID(),
        name: form.name.trim(),
        room: form.room.trim(),
        color: form.color,
      },
    ]);
    setForm({ name: "", room: "", color: "#8cae8a" });
    setMessage("");
    setIsDialogOpen(false);
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
        {subjects.length === 0 ? (
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
                className="rounded-[24px] border border-[#ddd4c3] bg-[#fbf9f4] p-5"
              >
                <div
                  className="mb-4 h-3 w-16 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <p className="text-2xl font-semibold text-[#354737]">{subject.name}</p>
                <p className="mt-1 text-lg text-[#6e7c69]">
                  {subject.room || "Room not set"}
                </p>
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
            <Button onClick={handleCreateSubject}>Create</Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
