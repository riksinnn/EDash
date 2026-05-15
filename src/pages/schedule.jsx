import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { recordActivity } from "../lib/activityLog";
import {
  fetchUpcomingGoogleCalendarEvents,
  getGoogleCalendarAccessToken,
} from "../lib/googleCalendar";
import { supabase } from "../lib/supabase";
import ScheduleView from "../views/schedule/ScheduleView";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dayMap = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
const scheduleSelectWithTeacher =
  "id, subject_id, day_of_week, start_time, end_time, subjects ( name, color, room, teacher )";
const scheduleSelectFallback =
  "id, subject_id, day_of_week, start_time, end_time, subjects ( name, color, room )";
const subjectsSelectWithTeacher = "id, name, color, room, teacher";
const subjectsSelectFallback = "id, name, color, room";

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
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [isGoogleSyncConfirmOpen, setIsGoogleSyncConfirmOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteAllDays, setDeleteAllDays] = useState(false);
  const [form, setForm] = useState({
    subject_id: "",
    days: [days[new Date().getDay()]],
    start_time: "",
    end_time: "",
  });

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    if (isNaN(parseInt(hours, 10)) || isNaN(parseInt(minutes, 10))) return "";

    const hourValue = parseInt(hours, 10);
    const ampm = hourValue >= 12 ? "PM" : "AM";
    const formattedHours = hourValue % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.id) return;

      let { data: scheduleData, error: scheduleError } = await supabase
        .from("schedule")
        .select(scheduleSelectWithTeacher)
        .eq("user_id", user.id);

      if (scheduleError) {
        console.warn("Retrying schedule load without teacher column:", scheduleError);
        const fallbackResult = await supabase
          .from("schedule")
          .select(scheduleSelectFallback)
          .eq("user_id", user.id);
        scheduleData = fallbackResult.data;
        scheduleError = fallbackResult.error;
      }

      if (scheduleError) {
        console.error("Error fetching schedule:", scheduleError);
        setErrorMessage("Could not load your saved schedule.");
      } else if (scheduleData) {
        const formattedEntries = scheduleData.map((entry) => ({
          id: entry.id,
          subject_id: String(entry.subject_id),
          day: days[entry.day_of_week],
          dayIndex: entry.day_of_week,
          subject: entry.subjects?.name || "Unnamed Class",
          startTime: entry.start_time?.slice(0, 5),
          endTime: entry.end_time?.slice(0, 5),
          color: entry.subjects?.color,
          room: entry.subjects?.room,
          teacher: entry.subjects?.teacher,
        }));

        setEntries(formattedEntries);
      }

      let { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select(subjectsSelectWithTeacher)
        .eq("user_id", user.id)
        .order("name");

      if (subjectsError) {
        console.warn("Retrying subjects load without teacher column:", subjectsError);
        const fallbackResult = await supabase
          .from("subjects")
          .select(subjectsSelectFallback)
          .eq("user_id", user.id)
          .order("name");
        subjectsData = fallbackResult.data;
        subjectsError = fallbackResult.error;
      }

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
      } else {
        setSubjects(subjectsData);
      }
    };

    loadInitialData();
  }, [user]);

  const setSelectedDayAndForm = (day) => {
    setSelectedDay(day);
    setForm((current) => ({ ...current, days: [day] }));
  };

  const dayEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.day === selectedDay)
        .sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00")),
    [entries, selectedDay]
  );

  const openEditDialog = (entry) => {
    setIsSaving(false);
    const relatedEntries = entries.filter(
      (candidate) =>
        candidate.subject_id === entry.subject_id &&
        candidate.startTime === entry.startTime &&
        candidate.endTime === entry.endTime
    );
    const relatedDays = relatedEntries.map((candidate) => candidate.day);

    setForm({
      subject_id: String(entry.subject_id),
      days: relatedDays,
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
    setDeleteAllDays(false);
    setIsDeleteDialogOpen(true);
  };

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
        const date = new Date();
        const [hours, minutes] = time.split(":");
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return date;
      };

      const newStartTime = timeToDate(form.start_time);
      const newEndTime = timeToDate(form.end_time);

      if (newStartTime >= newEndTime) {
        setErrorMessage("End time must be after start time.");
        setIsSaving(false);
        return;
      }

      const existingEntries = entries.filter(
        (entry) => entry.subject_id === selectedEntry.subject_id
      );
      const existingDays = existingEntries.map((entry) => entry.day);
      const daysToUpdate = form.days.filter((day) => existingDays.includes(day));
      const daysToAdd = form.days.filter((day) => !existingDays.includes(day));

      const conflictingEntries = entries.filter((entry) => {
        if (entry.subject_id === selectedEntry.subject_id) return false;
        if (!form.days.includes(entry.day)) return false;

        const existingStartTime = timeToDate(entry.startTime);
        const existingEndTime = timeToDate(entry.endTime);
        return newStartTime < existingEndTime && newEndTime > existingStartTime;
      });

      if (conflictingEntries.length > 0) {
        if (conflictingEntries.length === 1) {
          const conflict = conflictingEntries[0];
          setErrorMessage(
            `Time overlaps with ${conflict.subject} on ${conflict.day} (${formatTime(
              conflict.startTime
            )} - ${formatTime(conflict.endTime)}).`
          );
        } else {
          setErrorMessage("Time overlaps with multiple classes. Please choose another time.");
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

        const { data, error } = await supabase.from("schedule").insert(payloads).select();

        if (error) {
          console.error(error);
          setErrorMessage("Failed to add new schedule days.");
          setIsSaving(false);
          return;
        }

        insertedData = data;
      }

      const selectedSubject = subjects.find(
        (subject) => String(subject.id) === String(form.subject_id)
      );

      setEntries((current) =>
        current.map((entry) => {
          const isSameEntry =
            entry.subject_id === selectedEntry.subject_id && daysToUpdate.includes(entry.day);

          if (!isSameEntry) return entry;

          return {
            ...entry,
            subject_id: form.subject_id,
            subject: selectedSubject?.name || entry.subject,
            startTime: form.start_time,
            endTime: form.end_time,
            color: selectedSubject?.color,
            room: selectedSubject?.room,
            teacher: selectedSubject?.teacher,
          };
        })
      );

      if (insertedData.length > 0) {
        const newEntries = insertedData.map((item) => ({
          id: item.id,
          subject_id: item.subject_id,
          day: days[item.day_of_week],
          dayIndex: item.day_of_week,
          subject: selectedSubject?.name || "Unnamed Class",
          startTime: item.start_time.slice(0, 5),
          endTime: item.end_time.slice(0, 5),
          color: selectedSubject?.color,
          room: selectedSubject?.room,
          teacher: selectedSubject?.teacher,
        }));

        setEntries((current) => [...current, ...newEntries]);
      }

      setIsEditDialogOpen(false);
      setSelectedEntry(null);
      setSuccessMessage("Class updated successfully");

      await recordActivity({
        userId: user.id,
        action: "updated",
        entityType: "schedule",
        entityId: selectedEntry.id,
        description: `Updated schedule for ${selectedSubject?.name || "class"}`,
        metadata: { days: form.days, start_time: form.start_time, end_time: form.end_time },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong.");
    }

    setIsSaving(false);
  };

  const handleDeleteSchedule = async () => {
    if (!selectedEntry) return;

    let query = supabase
      .from("schedule")
      .delete()
      .eq("user_id", user.id)
      .eq("subject_id", selectedEntry.subject_id);

    if (deleteAllDays) {
      query = query
        .eq("start_time", `${selectedEntry.startTime}:00`)
        .eq("end_time", `${selectedEntry.endTime}:00`);
    } else {
      query = query.eq("day_of_week", dayMap[selectedEntry.day]);
    }

    const { error: deleteError } = await query;

    if (deleteError) {
      console.error("Error deleting schedule:", deleteError);
      alert("Could not delete the class.");
    } else {
      await recordActivity({
        userId: user?.id,
        action: "deleted",
        entityType: "schedule",
        entityId: selectedEntry.id,
        description: `Deleted schedule for ${selectedEntry.subject}`,
        metadata: {
          day: selectedEntry.day,
          start_time: selectedEntry.startTime,
          end_time: selectedEntry.endTime,
          delete_all_days: deleteAllDays,
        },
      });

      setEntries((current) => {
        if (deleteAllDays) {
          return current.filter(
            (entry) =>
              !(
                entry.subject_id === selectedEntry.subject_id &&
                entry.startTime === selectedEntry.startTime &&
                entry.endTime === selectedEntry.endTime
              )
          );
        }

        return current.filter((entry) => entry.id !== selectedEntry.id);
      });

      setSuccessMessage("Class deleted successfully");
    }

    setIsDeleteDialogOpen(false);
    setSelectedEntry(null);
  };

  const handleSchedule = async () => {
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
      const date = new Date();
      const [hours, minutes] = time.split(":");
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date;
    };

    const newStartTime = timeToDate(form.start_time);
    const newEndTime = timeToDate(form.end_time);

    if (newStartTime >= newEndTime) {
      setErrorMessage("End time must be after start time.");
      setIsSaving(false);
      return;
    }

    const conflictingEntries = entries.filter((entry) => {
      if (!form.days.includes(entry.day)) return false;
      const existingStartTime = timeToDate(entry.startTime);
      const existingEndTime = timeToDate(entry.endTime);
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });

    if (conflictingEntries.length > 0) {
      if (conflictingEntries.length === 1) {
        const conflict = conflictingEntries[0];
        setErrorMessage(
          `Time overlaps with ${conflict.subject} on ${conflict.day} (${formatTime(
            conflict.startTime
          )} - ${formatTime(conflict.endTime)}).`
        );
      } else {
        setErrorMessage("Time overlaps with multiple classes. Please choose another time.");
      }

      setIsSaving(false);
      return;
    }

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

    const selectedSubject = subjects.find((subject) => subject.id === form.subject_id);
    const newEntries = data.map((item) => ({
      id: item.id,
      subject_id: item.subject_id,
      day: days[item.day_of_week],
      dayIndex: item.day_of_week,
      subject: selectedSubject?.name || "Unnamed Class",
      startTime: item.start_time.slice(0, 5),
      endTime: item.end_time.slice(0, 5),
      color: selectedSubject?.color,
      room: selectedSubject?.room,
      teacher: selectedSubject?.teacher,
    }));

    setEntries((current) => [...current, ...newEntries]);
    if (form.days.length > 0) {
      setSelectedDayAndForm(form.days[0]);
    }
    setSuccessMessage("Class scheduled successfully");
    setIsDialogOpen(false);
    setIsSaving(false);

    await recordActivity({
      userId: user.id,
      action: "created",
      entityType: "schedule",
      entityId: data[0]?.id,
      description: `Scheduled ${selectedSubject?.name || "class"}`,
      metadata: { days: form.days, start_time: form.start_time, end_time: form.end_time },
    });
  };

  const formatTimeValue = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  const getOrCreateSubjectFromEvent = async (event, subjectCache) => {
    const subjectName = event.summary?.trim();
    if (!subjectName) return null;

    const key = subjectName.toLowerCase();
    const existingSubject = subjectCache.get(key);
    if (existingSubject) return existingSubject;

    const teacher =
      event.organizer?.displayName || event.creator?.displayName || event.organizer?.email || null;

    const { data, error } = await supabase.rpc("create_subject_for_user", {
      name: subjectName,
      room: event.location?.trim() || null,
      teacher,
      color: "#8cae8a",
    });

    if (error) throw error;

    const newSubject = {
      id: data.id,
      name: data.name,
      color: data.color,
      room: data.room,
      teacher: data.teacher,
    };

    subjectCache.set(key, newSubject);
    setSubjects((current) => {
      if (current.some((subject) => subject.id === newSubject.id)) return current;
      return [...current, newSubject].sort((a, b) => a.name.localeCompare(b.name));
    });

    await recordActivity({
      userId: user.id,
      action: "created",
      entityType: "subject",
      entityId: newSubject.id,
      description: `Created subject ${newSubject.name} from Google Calendar`,
      metadata: { source: "google_calendar" },
    });

    return newSubject;
  };

  const handleGoogleCalendarSync = async () => {
    if (!user?.id || isSyncingCalendar) return;

    setIsGoogleSyncConfirmOpen(false);
    setIsSyncingCalendar(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const accessToken = await getGoogleCalendarAccessToken();
      const events = await fetchUpcomingGoogleCalendarEvents(accessToken);
      const subjectCache = new Map(
        subjects.map((subject) => [subject.name.trim().toLowerCase(), subject])
      );
      const scheduleKeys = new Set(
        entries.map(
          (entry) =>
            `${entry.subject_id}|${entry.dayIndex}|${entry.startTime}|${entry.endTime}`
        )
      );
      const schedulePayloads = [];
      const nextEntries = [];

      for (const event of events) {
        const subject = await getOrCreateSubjectFromEvent(event, subjectCache);
        if (!subject) continue;

        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);
        const dayIndex = startDate.getDay();
        const day = days[dayIndex];
        const startTime = formatTimeValue(startDate);
        const endTime = formatTimeValue(endDate);
        const scheduleKey = `${subject.id}|${dayIndex}|${startTime}|${endTime}`;
        const isDuplicate = scheduleKeys.has(scheduleKey);

        if (isDuplicate) continue;
        scheduleKeys.add(scheduleKey);

        schedulePayloads.push({
          user_id: user.id,
          subject_id: subject.id,
          day_of_week: dayIndex,
          start_time: startTime,
          end_time: endTime,
        });

        nextEntries.push({
          subject_id: String(subject.id),
          day,
          dayIndex,
          subject: subject.name,
          startTime,
          endTime,
          color: subject.color,
          room: subject.room,
          teacher: subject.teacher,
        });
      }

      if (schedulePayloads.length === 0) {
        setSuccessMessage("Google Calendar is already synced.");
        return;
      }

      const { data, error } = await supabase.from("schedule").insert(schedulePayloads).select();

      if (error) throw error;

      const insertedEntries = nextEntries.map((entry, index) => ({
        ...entry,
        id: data[index].id,
      }));

      setEntries((current) => [...current, ...insertedEntries]);
      setSuccessMessage(`Synced ${insertedEntries.length} Google Calendar class events.`);

      await recordActivity({
        userId: user.id,
        action: "synced",
        entityType: "schedule",
        description: `Synced ${insertedEntries.length} Google Calendar events`,
        metadata: { source: "google_calendar", count: insertedEntries.length },
      });
    } catch (error) {
      console.error("Google Calendar sync failed:", error);
      setErrorMessage(error.message || "Could not sync Google Calendar.");
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  return (
    <ScheduleView
      days={days}
      selectedDay={selectedDay}
      onSelectedDayChange={setSelectedDayAndForm}
      onOpenNewDialog={() => {
        if (subjects.length === 0) {
          setIsNoSubjectsOpen(true);
          return;
        }

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
      onOpenGoogleSyncConfirm={() => setIsGoogleSyncConfirmOpen(true)}
      onGoogleSyncConfirmClose={() => setIsGoogleSyncConfirmOpen(false)}
      onSyncGoogleCalendar={handleGoogleCalendarSync}
      dayEntries={dayEntries}
      formatTime={formatTime}
      onOpenEditDialog={openEditDialog}
      onOpenDeleteDialog={openDeleteDialog}
      isDialogOpen={isDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      isDeleteDialogOpen={isDeleteDialogOpen}
      isNoSubjectsOpen={isNoSubjectsOpen}
      subjects={subjects}
      form={form}
      errorMessage={errorMessage}
      successMessage={successMessage}
      isSaving={isSaving}
      isSyncingCalendar={isSyncingCalendar}
      isGoogleSyncConfirmOpen={isGoogleSyncConfirmOpen}
      deleteAllDays={deleteAllDays}
      onDialogClose={() => setIsDialogOpen(false)}
      onEditDialogClose={() => setIsEditDialogOpen(false)}
      onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
      onNoSubjectsClose={() => setIsNoSubjectsOpen(false)}
      onFormSubjectChange={(value) => setForm((current) => ({ ...current, subject_id: value }))}
      onFormDayToggle={(day) => {
        setForm((current) => {
          const isSelected = current.days?.includes(day);
          const newDays = isSelected
            ? current.days.filter((candidate) => candidate !== day)
            : [...current.days, day];
          return { ...current, days: newDays };
        });
      }}
      onFormStartTimeChange={(value) => setForm((current) => ({ ...current, start_time: value }))}
      onFormEndTimeChange={(value) => setForm((current) => ({ ...current, end_time: value }))}
      onScheduleSubmit={handleSchedule}
      onUpdateSubmit={handleUpdateSchedule}
      onDeleteSubmit={handleDeleteSchedule}
      onDeleteAllDaysChange={setDeleteAllDays}
      onGoToSubjects={() => {
        setIsNoSubjectsOpen(false);
        navigate("/subjects");
      }}
    />
  );
}
