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
import { useNavigate } from "react-router-dom";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dayMap = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay()]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNoSubjectsOpen, setIsNoSubjectsOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteAllDays, setDeleteAllDays] = useState(false);
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

    const showMessage = (type, text) => {
    if (type === "error") {
      setErrorMessage("");
      setSuccessMessage("");
      setTimeout(() => setErrorMessage(text), 0);
    } else {
      setSuccessMessage("");
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(text), 0);
    }
  };

  // Auto-clear messages after 2.5 seconds
useEffect(() => {

  if (!errorMessage && !successMessage) return;

    const timer = setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [errorMessage, successMessage]);


  // Load schedule and subjects on mount
 useEffect(() => {
  const loadInitialData = async () => {
    if (!user?.id) return;

    const { data: scheduleData, error: scheduleError } = await supabase
      .from("schedule")
      .select("id, subject_id, day_of_week, start_time, end_time, subjects ( name, color )")
      .eq("user_id", user.id);

    if (scheduleError) {
      console.error("Error fetching schedule:", scheduleError);
    } else if (scheduleData) {
      const formattedEntries = scheduleData.map((entry) => ({
        id: entry.id,
        subject_id: String(entry.subject_id),
        day: days[entry.day_of_week],
        subject: entry.subjects?.name || "Unnamed Class",
        startTime: entry.start_time?.slice(0, 5),
        endTime: entry.end_time?.slice(0, 5),
        color: entry.subjects?.color,
      }));

      setEntries(formattedEntries);
    }

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


  //Autosync Day Selection in Form when changing days
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
      setErrorMessage("");
      setSuccessMessage("");
      setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (entry) => {
      setSelectedEntry(entry);
      setDeleteAllDays(false); // reset every time
      setIsDeleteDialogOpen(true);
    };


    //FOR UPATING SCHEDULE
    const handleUpdateSchedule = async () => {
    if (isSaving) return;

 try {
    if (!form.subject_id || !user || !selectedEntry) {
      setIsSaving(false);
      return;
    }

    if (!form.start_time || !form.end_time) {
      setErrorMessage("Select both start and end time.");
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    const timeToDate = (time) => {
      const d = new Date();
      const [h, m] = time.split(":");
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return d;
    };

    const newStartTime = timeToDate(form.start_time);
    const newEndTime = timeToDate(form.end_time);

    if (newStartTime >= newEndTime) {
      setErrorMessage("End time must be after start time.");
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
      if (conflictingEntries.length === 1) {
        const e = conflictingEntries[0];
        setErrorMessage(
          `Time overlaps with ${e.subject} on ${e.day} (${formatTime(e.startTime)} - ${formatTime(e.endTime)}).`
        );
      } else {
        setErrorMessage(
          `Time overlaps with multiple classes. Please choose another time.`
        );
      }

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
        setErrorMessage("Failed to add new schedule days.");
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
    setSuccessMessage("Class updated successfully");

} catch (err) {
  console.error(err);
  setErrorMessage("Something went wrong.");
}
    setIsSaving(false); 
  };
  
 //END OF UPDATE SCHEDULE

//FOR DELETING SCHEDULE
  const handleDeleteSchedule = async () => {
    if (!selectedEntry) return;

    

    const { error } = await supabase
    let query = supabase
      .from("schedule")
      .delete()
      .eq("user_id", user.id)
      .eq("subject_id", selectedEntry.subject_id);

    if (deleteAllDays) {
      //  delete ALL matching days (group)
      query = query
        .eq("start_time", `${selectedEntry.startTime}:00`)
        .eq("end_time", `${selectedEntry.endTime}:00`);
    } else {
      //  delete ONLY this specific day
      query = query.eq("day_of_week", dayMap[selectedEntry.day]);
    }

    const { error: deleteError } = await query;

    if (deleteError) {
      console.error("Error deleting schedule:", deleteError); 
      alert("Could not delete the class.");
    } else {

      setEntries((current) => {
        if (deleteAllDays) {
          // remove whole group
          return current.filter(
            (entry) =>
              !(
                entry.subject_id === selectedEntry.subject_id &&
                entry.startTime === selectedEntry.startTime &&
                entry.endTime === selectedEntry.endTime
              )
          );
        } else {
          // remove only selected day
          return current.filter((entry) => entry.id !== selectedEntry.id);
        }
      });

      setSuccessMessage("Class deleted successfully");
    }

    setIsDeleteDialogOpen(false);
    setSelectedEntry(null);
  };
//END OF DELETE SCHEDULE

//START SCHEDULE HANDLER
  const handleSchedule = async () => {

    // VALIDATION
    if (!form.subject_id) {
      setErrorMessage("Please select a subject.");
      return;
    }

    if (!form.days || form.days.length === 0) {
      setErrorMessage("Please select at least one day.");
      return;
    }

    if (!form.start_time || !form.end_time) {
      setErrorMessage("Please select both start and end time.");
      return;
    }

    if (!user) {
      setErrorMessage("User not found. Please log in again.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const timeToDate = (time) => {
      const d = new Date();
      const [h, m] = time.split(":");
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return d;
    };

    const newStartTime = timeToDate(form.start_time);
    const newEndTime = timeToDate(form.end_time);

    if (newStartTime >= newEndTime) {
      setErrorMessage("End time must be after start time.");
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
      if (conflictingEntries.length === 1) {
        const e = conflictingEntries[0];
        setErrorMessage(
          `Time overlaps with ${e.subject} on ${e.day} (${formatTime(e.startTime)} - ${formatTime(e.endTime)}).`
        );
      } else {
        setErrorMessage(
          `Time overlaps with multiple classes. Please choose another time.`
        );
      }

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
      setErrorMessage("We couldn't save the classes. Please try again.");
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
    setSuccessMessage("Class scheduled successfully");
    setIsDialogOpen(false);
    setIsSaving(false);
  };
//END OF SCHEDULE HANDLER

  return (
    <div className="space-y-7">

      {/* GLOBAL TOAST MESSAGE */}
        {(errorMessage || successMessage) && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow text-white transition-all duration-300
            ${errorMessage ? "bg-red-500" : "bg-green-500"}`}
          >
            {errorMessage || successMessage}
          </div>
        )}

        {successMessage && (
          <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow text-white bg-green-500">
            {successMessage}
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
                  ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--app-panel)]"
                  : "border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--text-secondary)]",
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
              // NO SUBJECTS YET
              if (subjects.length === 0) {
                setIsNoSubjectsOpen(true);
                return;
              }

              // NORMAL FLOW
              setForm({
                subject_id: "",
                days: [selectedDay],
                start_time: "",
                end_time: "",
              });

              setErrorMessage("");
              setSuccessMessage("");

              setIsDialogOpen(true);
            }}
          aria-label="Schedule class"
        >
          <Plus size={22} />
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-5xl font-semibold text-[var(--text-primary)]">
          {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}&apos;s Classes
        </h2>

        <Card className="min-h-[260px] border-dashed border-[var(--app-border)] bg-[color:color-mix(in_srgb,var(--app-panel)_92%,transparent)] p-7 shadow-none">
          {dayEntries.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-center text-2xl text-[var(--text-secondary)]">
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
                    <p className="text-2xl font-semibold text-[var(--text-primary)]">{entry.subject}</p>
                    <p className="mt-2 text-lg text-[var(--text-muted)]">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
                      <Edit size={20} className="text-[var(--text-muted)]" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(entry)}>
                      <Trash2 size={20} className="text-[var(--text-muted)]" />
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
        <div className="max-h-[80vh] space-y-6 overflow-y-auto pr-1">

          {subjects.length === 0 && (
            <div cclassName="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4 text-sm text-[var(--text-secondary)]">
              No subjects yet. Add your first subject first before scheduling a class.
            </div>
          )}

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
            <label className="text-sm font-medium text-[var(--text-secondary)]">Days</label>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-[var(--app-panel-soft)] p-2 sm:grid-cols-7">
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
  ? "bg-[var(--text-primary)] text-[var(--app-panel)] shadow-sm"
  : "bg-[var(--app-panel)] text-[var(--text-secondary)] hover:bg-[var(--hover-soft)]",
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
        <div className="max-h-[80vh] space-y-6 overflow-y-auto pr-1">
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
            <label className="text-sm font-medium text-[var(--text-secondary)]">Days</label>
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-[var(--app-panel-soft)] p-2 sm:grid-cols-7">
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
              onChange={(e) => setDeleteAllDays(e.target.checked)}
            />
            <label className="text-sm text-[var(--text-secondary)]">
              Delete all days for this class
            </label>
          </div>

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

      <AlertDialog
        open={isNoSubjectsOpen}
        title="No Subjects Yet"
        onClose={() => setIsNoSubjectsOpen(false)}
      >
        <div className="space-y-5">
          <p className="text-[var(--text-secondary)]">
            Add your first subject before scheduling a class.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsNoSubjectsOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                setIsNoSubjectsOpen(false);
                navigate("/subjects");
              }}
            >
              Go to Subjects
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}