import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dayMap = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay()]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [form, setForm] = useState({
    day: days[new Date().getDay()],
    subject_id: "",
    start_time: "",
    end_time: "",
  });

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    if (isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return ""; // Handle invalid time

    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;

      // Fetch schedule entries with subject names
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("schedule")
        .select("id, day_of_week, start_time, end_time, subjects ( name )")
        .eq("user_id", user.id);

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
      } else if (scheduleData) {
        const formattedEntries = scheduleData.map((entry) => ({
          id: entry.id,
          day: days[entry.day_of_week],
          subject: entry.subjects?.name || "Unnamed Class",
          startTime: entry.start_time,
          endTime: entry.end_time,
        }));
        setEntries(formattedEntries);
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

  const dayEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.day === selectedDay)
        .sort((a, b) => {
          // Defensively handle cases where startTime might be null or undefined to prevent crash
          const timeA = a.startTime || "00:00";
          const timeB = b.startTime || "00:00";
          return timeA.localeCompare(timeB);
        }),
    [entries, selectedDay],
  );

  const handleSchedule = async () => {
    if (!form.subject_id || !user) return;

    // --- Time Overlap Validation ---
    if (!form.start_time || !form.end_time) {
      setMessage("Please select a start and end time.");
      return;
    }

    const timeToDate = (time) => {
      const d = new Date();
      const [h, m] = time.split(":");
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return d;
    };

    const newStartTime = timeToDate(form.start_time);
    const newEndTime = timeToDate(form.end_time);

    if (newStartTime >= newEndTime) {
      setMessage("End time must be after start time.");
      return;
    }

    const conflictingEntry = entries.find((entry) => {
      // Don't compare an entry against itself while editing
      if (editingEntry && entry.id === editingEntry.id) {
        return false;
      }
      if (entry.day !== form.day) {
        return false;
      }
      const existingStartTime = timeToDate(entry.startTime);
      const existingEndTime = timeToDate(entry.endTime);

      // Check for overlap: (StartA < EndB) and (EndA > StartB)
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });

    if (conflictingEntry) {
      setMessage(`This time conflicts with "${conflictingEntry.subject}".`);
      return;
    }
    // --- End Validation ---

    if (editingEntry) {
      await handleUpdateSchedule();
    } else {
      await handleCreateSchedule();
    }
  };

  const handleCreateSchedule = async () => {
    const schedulePayload = {
      user_id: user.id,
      subject_id: form.subject_id,
      day_of_week: dayMap[form.day],
      start_time: form.start_time,
      end_time: form.end_time,
    };

    const { data, error } = await supabase
      .from("schedule")
      .insert([schedulePayload])
      .select()
      .single();

    if (error) {
      console.error(error);
      setMessage("We couldn't save that class yet.");
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === form.subject_id);

    setEntries((current) => [
      ...current,
      {
        id: data.id,
        day: form.day,
        subject: selectedSubject?.name || "Unnamed Class",
        startTime: form.start_time,
        endTime: form.end_time,
      },
    ]);
    setSelectedDay(form.day);
    closeDialog();
  };

  const handleUpdateSchedule = async () => {
    if (!form.subject_id || !user || !editingEntry) return;

    const schedulePayload = {
      user_id: user.id,
      subject_id: form.subject_id,
      day_of_week: dayMap[form.day],
      start_time: form.start_time,
      end_time: form.end_time,
    };

    const { data, error } = await supabase
      .from("schedule")
      .update(schedulePayload)
      .eq("id", editingEntry.id)
      .select("*, subjects(name)")
      .single();

    if (error) {
      console.error("Error updating schedule:", error);
      setMessage("We couldn't update that class yet.");
      return;
    }

    setEntries((current) =>
      current.map((entry) =>
        entry.id === editingEntry.id
          ? {
              id: data.id,
              day: days[data.day_of_week],
              subject: data.subjects?.name || "Unnamed Class",
              startTime: data.start_time,
              endTime: data.end_time,
            }
          : entry,
      ),
    );

    setSelectedDay(form.day);
    closeDialog();
  };

  const handleDeleteSchedule = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    const { error } = await supabase.from("schedule").delete().eq("id", entryId);

    if (error) {
      console.error("Error deleting schedule entry:", error);
      alert("Could not delete the class.");
    } else {
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
    }
  };

  const openEditDialog = (entry) => {
    setEditingEntry(entry);
    setForm({
      day: entry.day,
      subject_id: subjects.find((s) => s.name === entry.subject)?.id || "",
      start_time: entry.startTime,
      end_time: entry.endTime,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingEntry(null);
    setForm({
      day: selectedDay,
      subject_id: "",
      start_time: "",
      end_time: "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    setMessage("");
    setForm({ day: selectedDay, subject_id: "", start_time: "", end_time: "" });
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          {days.map((day) => {
            const isActive = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={[
                  "flex h-18 min-w-16 flex-col items-center justify-center rounded-[20px] border px-4 py-3 text-xl font-medium transition-colors",
                  isActive
                    ? "border-[#1f2a1c] bg-[#1f2a1c] text-[#f7f4ee]"
                    : "border-[#ddd4c3] bg-[#f8f5ef] text-[#4e5e4c]",
                ].join(" ")}
              >
                <span>{day}</span>
                <span className={isActive ? "mt-1 text-base opacity-70" : "hidden"}>•</span>
              </button>
            );
          })}
        </div>

        <Button onClick={openNewDialog} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Class</span>
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-5xl font-semibold text-[#283728]">
          {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}&apos;s Classes
        </h2>

        <Card className="min-h-[260px] border-dashed border-[#e3dbcc] bg-[#f7f4ee]/70 p-7 shadow-none">
          {dayEntries.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-center text-2xl text-[#6e7c69]">
              Nothing scheduled for this day yet.
            </div>
          ) : (
            <div className="space-y-4">
              {dayEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="group flex items-center justify-between rounded-3xl border border-[#ddd4c3] bg-[#fbf9f4] p-5 transition-all hover:border-[#c2b8a8]"
                >
                  <div>
                    <p className="text-2xl font-semibold text-[#354737]">{entry.subject}</p>
                    <p className="mt-2 text-lg text-[#6e7c69]">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
                      <Edit size={20} className="text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSchedule(entry.id)}>
                      <Trash2 size={20} className="text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Class" : "Add a new class"}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select value={form.day} onValueChange={(value) => setForm({ ...form, day: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={form.subject_id}
                onValueChange={(value) => setForm({ ...form, subject_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            {message && <p className="text-sm text-red-500">{message}</p>}
            <Button onClick={handleSave} className="w-full">
              {editingEntry ? "Save Changes" : "Save Class"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}