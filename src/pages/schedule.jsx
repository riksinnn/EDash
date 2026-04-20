import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clock3, Plus, Edit, Trash2 } from "lucide-react";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xl font-medium text-[#354737]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-4 py-3 pr-11 text-xl text-[#425642] shadow-[0_5px_18px_rgba(75,84,63,0.08)] outline-none focus:border-[#89a171]"
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7e8c7a]"
        />
      </span>
    </label>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xl font-medium text-[#354737]">{label}</span>
      <span className="relative block">
        <input
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-4 py-3 pr-11 text-xl text-[#425642] shadow-[0_5px_18px_rgba(75,84,63,0.08)] outline-none focus:border-[#89a171]"
        />
        <Clock3
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#1e211c]"
        />
      </span>
    </label>
  );
}