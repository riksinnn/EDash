import { useMemo, useState } from "react";
import { ChevronDown, Clock3, Plus } from "lucide-react";
import { AlertDialog } from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState("WED");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    subject: "Select subject",
    day: "WED",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
  });

  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.day === selectedDay),
    [entries, selectedDay],
  );

  const handleSchedule = async () => {
    if (form.subject === "Select subject" || !user) return;

    const schedulePayload = {
      user_id: user.uid,
      subject_id: crypto.randomUUID(),
      day_of_week: days.indexOf(form.day),
      start_time: form.startTime,
      end_time: form.endTime,
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

    setEntries((current) => [
      ...current,
      {
        id: data?.id ?? crypto.randomUUID(),
        ...form,
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
                <div
                  key={entry.id}
                  className="rounded-3xl border border-[#ddd4c3] bg-[#fbf9f4] p-5"
                >
                  <p className="text-2xl font-semibold text-[#354737]">{entry.subject}</p>
                  <p className="mt-2 text-lg text-[#6e7c69]">
                    {entry.startTime} - {entry.endTime}
                  </p>
                </div>
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
            value={form.subject}
            onChange={(value) =>
              setForm((current) => ({ ...current, subject: value }))
            }
            options={["Select subject", "Advanced Mathematics", "History", "Science"]}
          />

          <SelectField
            label="Day"
            value={form.day}
            onChange={(value) => setForm((current) => ({ ...current, day: value }))}
            options={days}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TimeField
              label="Start Time"
              value={form.startTime}
              onChange={(value) =>
                setForm((current) => ({ ...current, startTime: value }))
              }
            />
            <TimeField
              label="End Time"
              value={form.endTime}
              onChange={(value) =>
                setForm((current) => ({ ...current, endTime: value }))
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

function TimeField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xl font-medium text-[#354737]">{label}</span>
      <span className="relative block">
        <input
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
