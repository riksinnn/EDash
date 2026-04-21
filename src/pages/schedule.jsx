import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clock3, Plus, Edit, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { SelectField } from "../components/ui/SelectField";
import { TimeField } from "../components/ui/TimeField";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [form, setForm] = useState({
    subject_id: "",
    day: days[new Date().getDay()],
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

  const openEditDialog = (entry) => {
    setSelectedEntry(entry);
    setForm({
      subject_id: subjects.find((s) => s.name === entry.subject)?.id || "",
      day: entry.day,
      start_time: entry.startTime,
      end_time: entry.endTime,
    });
    setIsEditDialogOpen(true);
    setMessage(""); // Clear previous messages
  };

  const openDeleteDialog = (entry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateSchedule = async () => {
    if (!form.subject_id || !user || !selectedEntry) return;

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
      if (entry.id === selectedEntry.id) return false; // Exclude the entry being edited
      if (entry.day !== form.day) return false;

      const existingStartTime = timeToDate(entry.startTime);
      const existingEndTime = timeToDate(entry.endTime);
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });

    if (conflictingEntry) {
      setMessage(`This time conflicts with "${conflictingEntry.subject}".`);
      return;
    }
    // --- End Validation ---

    const schedulePayload = {
      subject_id: form.subject_id,
      day_of_week: dayMap[form.day],
      start_time: form.start_time,
      end_time: form.end_time,
    };

    const { data, error } = await supabase
      .from("schedule")
      .update(schedulePayload)
      .eq("id", selectedEntry.id)
      .select("*, subjects(name)")
      .single();

    if (error) {
      console.error("Error updating schedule:", error);
setMessage("We couldn't update that class yet.");
      return;
    }

    setEntries((current) =>
      current.map((entry) =>
        entry.id === selectedEntry.id
          ? {
              id: data.id,
              day: days[data.day_of_week],
              subject: data.subjects?.name || "Unnamed Class",
              startTime: data.start_time,
              endTime: data.end_time,
            }
          : entry
      )
    );

    setIsEditDialogOpen(false);
    setSelectedEntry(null);
    setMessage("");
  };

  const handleDeleteSchedule = async () => {
    if (!selectedEntry) return;

    const { error } = await supabase.from("schedule").delete().eq("id", selectedEntry.id);

    if (error) {
      console.error("Error deleting schedule:", error);
      alert("Could not delete the class.");
    } else {
      setEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
    }

    setIsDeleteDialogOpen(false);
    setSelectedEntry(null);
  };

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
    setMessage("");
    setIsDialogOpen(false);
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

        <Button
          variant="icon"
          className="h-12 w-12"
          onClick={() => setIsDialogOpen(true)}
          aria-label="Schedule class"
        >
          <Plus size={22} />
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
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(entry)}>
                      <Trash2 size={20} className="text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>

      <AlertDialog
        open={isDialogOpen}
        title="Schedule Class"
        onClose={() => setIsDialogOpen(false)}
      >
        <div className="space-y-6">
          <SelectField
            label="Subject"
            value={form.subject_id}
            onChange={(value) =>
              setForm((current) => ({ ...current, subject_id: value }))
            }
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Day"
            value={form.day}
            onChange={(value) => setForm((current) => ({ ...current, day: value }))}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </SelectField>

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeField
              label="Start Time"
              value={form.start_time}
              onChange={(value) =>
                setForm((current) => ({ ...current, start_time: value }))
              }
            />
            <TimeField
              label="End Time"
              value={form.end_time}
              onChange={(value) =>
                setForm((current) => ({ ...current, end_time: value }))
              }
            />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>Schedule</Button>
          </div>
        </div>
      </AlertDialog>

      {/* Edit Dialog */}
      <AlertDialog
        open={isEditDialogOpen}
        title="Edit Class"
        onClose={() => setIsEditDialogOpen(false)}
      >
        <div className="space-y-6">
          <SelectField
            label="Subject"
            value={form.subject_id}
            onChange={(value) =>
              setForm((current) => ({ ...current, subject_id: value }))
            }
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Day"
            value={form.day}
            onChange={(value) => setForm((current) => ({ ...current, day: value }))}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </SelectField>

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeField
              label="Start Time"
              value={form.start_time}
              onChange={(value) =>
                setForm((current) => ({ ...current, start_time: value }))
              }
            />
            <TimeField
              label="End Time"
              value={form.end_time}
              onChange={(value) =>
                setForm((current) => ({ ...current, end_time: value }))
              }
            />
          </div>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchedule}>Save Changes</Button>
          </div>
        </div>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        title="Delete Class"
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-lg text-[#6e7c69]">
            Are you sure you want to delete{" "}
            <strong>{selectedEntry?.subject}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSchedule}
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