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
import { TimeScrollPicker } from "../components/ui/TimeScrollPicker";

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
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [form, setForm] = useState({
    subject_id: "",
    days: [days[new Date().getDay()]], // Use 'days' array for multi-day support
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
        .select("id, subject_id, day_of_week, start_time, end_time, subjects ( name, color )")
        .eq("user_id", user.id);

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
      } else if (scheduleData) {
      const formattedEntries = scheduleData.map((entry) => ({
        id: entry.id,
        subject_id: String(entry.subject_id), // ADD THIS
        day: days[entry.day_of_week],
        subject: entry.subjects?.name || "Unnamed Class",
        startTime: entry.start_time?.slice(0, 5),
        endTime: entry.end_time?.slice(0, 5),
        color: entry.subjects?.color,
      }));
        setEntries(formattedEntries);
      }

      // Fetch subjects for the dropdown
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, color")
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


  //AUtosync Day Selection in Form when changing days
  useEffect(() => {
    setForm((current) => ({
      ...current,
      days: [selectedDay],
    }));
  }, [selectedDay]);

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
      setIsSaving(false);

      // 🔥 find all entries with same subject + same time
      const relatedEntries = entries.filter((e) => {
        return (
          e.subject_id === entry.subject_id &&
          e.startTime === entry.startTime &&
          e.endTime === entry.endTime
        );
      });

      // 🔥 extract all days
      const relatedDays = relatedEntries.map((e) => e.day);

      setForm({
        subject_id: String(entry.subject_id),
        days: relatedDays, // ✅ MULTIPLE DAYS NOW
        start_time: entry.startTime,
        end_time: entry.endTime,
      });

      setSelectedEntry(entry);
      setMessage("");
      setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (entry) => {
      setSelectedEntry(entry);
      setIsDeleteDialogOpen(true);
    };


    //FOR UPATING SCHEDULE
    const handleUpdateSchedule = async () => {
    if (isSaving) return;
    setIsSaving(true);

 try {
    if (!form.subject_id || !user || !selectedEntry) {
      setIsSaving(false);
      return;
    }

    if (!form.start_time || !form.end_time) {
      setMessage("Please select a start and end time.");
      setIsSaving(false);
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
      setIsSaving(false);
      return;
    }

    const originalEntries = entries.filter((e) => {
     return (
      e.subject_id === selectedEntry.subject_id &&
      e.startTime === selectedEntry.startTime &&
      e.endTime === selectedEntry.endTime
     );
    });

    //get ALL existing days for this subject (not just same time)
    const existingEntries = entries.filter(
      (e) => e.subject_id === selectedEntry.subject_id
    );

    const existingDays = existingEntries.map((e) => e.day);

    // split daysToUpdate properly into daysToUpdate and daysToAdd
    const daysToUpdate = form.days.filter((d) => existingDays.includes(d));
    const daysToAdd = form.days.filter((d) => !existingDays.includes(d));

    const conflictingEntries = entries.filter((entry) => {
      //ignore ALL entries of the same subject (the one being edited)
      const isSameSubjectBeingEdited =
        entry.subject_id === selectedEntry.subject_id;

      if (isSameSubjectBeingEdited) return false;

      // only check selected days
      if (!form.days.includes(entry.day)) return false;

      const existingStartTime = timeToDate(entry.startTime);
      const existingEndTime = timeToDate(entry.endTime);

      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });

    if (conflictingEntries.length > 0) {
      const conflictingSubjects = conflictingEntries.map((e) => e.subject).join(", ");
      setMessage(`This time conflicts with: ${conflictingSubjects}.`);
      setIsSaving(false);
      return;
    }

    await Promise.all(
      existingEntries
        .filter((entry) => daysToUpdate.includes(entry.day))
        .map((entry) =>
          supabase
            .from("schedule")
            .update({
              subject_id: form.subject_id,
              start_time: `${form.start_time}:00`,
              end_time: `${form.end_time}:00`,
            })
            .eq("id", entry.id)
        )
    );

    let insertedData = [];

    if (daysToAdd.length > 0) {
      const payloads = daysToAdd.map((day) => ({
        user_id: user.id,
        subject_id: form.subject_id,
        day_of_week: dayMap[day],
        start_time: `${form.start_time}:00`,
        end_time: `${form.end_time}:00`,
      }));

      const { data, error } = await supabase
        .from("schedule")
        .insert(payloads)
        .select();

      if (error) {
        console.error(error);
        setMessage("Failed to add new schedule days.");
        setIsSaving(false);
        return;
      }

      insertedData = data;
    }


    const selectedSubject = subjects.find(
        (s) => String(s.id) === String(form.subject_id)
      );

    setEntries((current) =>
      current.map((entry) => {
        const isSameEntry =
          entry.subject_id === selectedEntry.subject_id &&
          daysToUpdate.includes(entry.day);

        if (!isSameEntry) return entry;

        return {
          ...entry,
          subject_id: form.subject_id,
          subject: selectedSubject?.name || entry.subject,
          startTime: form.start_time,
          endTime: form.end_time,
          color: selectedSubject?.color,
        };
      })
    );

    // add newly inserted entries
    if (insertedData.length > 0) {
      const newEntries = insertedData.map((item) => ({
        id: item.id,
        subject_id: item.subject_id,
        day: days[item.day_of_week],
        subject: selectedSubject?.name || "Unnamed Class",
        startTime: item.start_time.slice(0, 5),
        endTime: item.end_time.slice(0, 5),
        color: selectedSubject?.color,
      }));

      setEntries((current) => [...current, ...newEntries]);
    }

    setIsEditDialogOpen(false);
    setSelectedEntry(null);
    setMessage("Class updated successfully");

} catch (err) {
  console.error(err);
  setMessage("Something went wrong.");
}
    setIsSaving(false); 

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };
  
 //END OF UPDATE SCHEDULE

//FOR DELETING SCHEDULE
  const handleDeleteSchedule = async () => {
    if (!selectedEntry) return;

    const { error } = await supabase
    .from("schedule")
    .delete()
    .eq("user_id", user.id)
    .eq("subject_id", selectedEntry.subject_id)
    .eq("start_time", `${selectedEntry.startTime}:00`)
    .eq("end_time", `${selectedEntry.endTime}:00`)

    if (error) {
      console.error("Error deleting schedule:", error);
      alert("Could not delete the class.");
    } else {

      setEntries((current) =>
        current.filter(
          (entry) =>
            !(
              entry.subject_id === selectedEntry.subject_id &&
              entry.startTime === selectedEntry.startTime &&
              entry.endTime === selectedEntry.endTime
            )
        )
      );

      setMessage("Class deleted successfully");
    }

    setIsDeleteDialogOpen(false);
    setSelectedEntry(null);
  };
//END OF DELETE SCHEDULE

//END OF DELETE SCHEDULE
  const handleSchedule = async () => {
    if (!form.subject_id || !user || form.days.length === 0) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    setMessage("");

    if (!form.start_time || !form.end_time) {
      setMessage("Please select a start and end time.");
      setIsSaving(false);
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
      setIsSaving(false);
      return;
    }

    // Updated to check for conflicts across multiple selected days
    const conflictingEntries = entries.filter((entry) => {
      if (!form.days.includes(entry.day)) {
        return false;
      }
      const existingStartTime = timeToDate(entry.startTime);
      const existingEndTime = timeToDate(entry.endTime);
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });

    if (conflictingEntries.length > 0) {
      const conflictingInfo = conflictingEntries
        .map((e) => `${e.subject} on ${e.day}`)
        .join(", ");
      setMessage(`This time conflicts with: ${conflictingInfo}.`);
      setIsSaving(false);
      return;
    }

    // Create multiple payloads for each selected day
    const payloads = form.days.map((day) => ({
      user_id: user.id,
      subject_id: form.subject_id,
      day_of_week: dayMap[day],
      start_time: form.start_time,
      end_time: form.end_time,
    }));

    const { data, error } = await supabase.from("schedule").insert(payloads).select();

    if (error) {
      console.error(error);
      setMessage("We couldn't save the classes. Please try again.");
      setIsSaving(false);
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === form.subject_id);

    // Add new entries to the local state for each newly created schedule
    const newEntries = data.map((item) => ({
      id: item.id,
      subject_id: item.subject_id,
      day: days[item.day_of_week],
      subject: selectedSubject?.name || "Unnamed Class",
      startTime: item.start_time.slice(0, 5),
      endTime: item.end_time.slice(0, 5),
      color: selectedSubject?.color,
    }));

    setEntries((current) => [...current, ...newEntries]);
    if (form.days.length > 0) {
      setSelectedDay(form.days[0]); // Set the selected day to the first new day
    }
    setMessage("Class scheduled successfully");
    setIsDialogOpen(false);
    setIsSaving(false);
  };
//END OF SCHEDULE HANDLER

  return (
    <div className="space-y-7">

      {/* ✅ GLOBAL TOAST MESSAGE */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow text-white
            ${message.includes("successfully") ? "bg-green-500" : "bg-red-500"}`}
        >
          {message}
        </div>
      )}

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
          onClick={() => {
            // Reset form for creating a new schedule, using the currently selected day as the default
            setForm({
              subject_id: "",
              days: [selectedDay],
              start_time: "",
              end_time: "",
            });
            setMessage(""); // Clear any previous error messages
            setIsDialogOpen(true);
          }}
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
                  className="group flex items-center justify-between rounded-3xl border p-5 transition-all"
                  style={{
                    borderLeft: `5px solid ${entry.color || "transparent"}`,
                  }}
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Days</label>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-gray-100 p-2 sm:grid-cols-7">
              {days.map((day) => {
                const isSelected = form.days?.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setForm((current) => {
                        const newDays = isSelected
                          ? current.days.filter((d) => d !== day)
                          : [...current.days, day];
                        return { ...current, days: newDays };
                      });
                    }}
                    className={cn(
                      "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-50",
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
              onChange={(value) =>
                setForm((current) => ({ ...current, start_time: value }))
              }
            />

            <TimeScrollPicker
              key={`end-${form.end_time}-${form.days}`}
              label="End Time"
              value={form.end_time}
              onChange={(value) =>
                setForm((current) => ({ ...current, end_time: value }))
              }
            />
          </div>

          {!message.includes("successfully") && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
              <Button onClick={handleSchedule} disabled={isSaving}>
                {isSaving ? "Saving..." : "Schedule"}
              </Button>
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
            value={String(form.subject_id || "")}
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Days</label>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-gray-100 p-2 sm:grid-cols-7">
              {days.map((day) => {
                const isSelected = form.days?.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setForm((current) => {
                        const newDays = isSelected
                          ? current.days.filter((d) => d !== day)
                          : [...current.days, day];

                        return { ...current, days: newDays };
                      });
                    }}
                    className={cn(
                      "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-50"
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
              onChange={(value) =>
                setForm((current) => ({ ...current, start_time: value }))
              }
            />

            <TimeScrollPicker
              key={`end-${form.end_time}-${form.days}`}
              label="End Time"
              value={form.end_time}
              onChange={(value) =>
                setForm((current) => ({ ...current, end_time: value }))
              }
            />
          </div>

          {!message.includes("successfully") && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchedule} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
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
              disabled={isSaving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSaving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}