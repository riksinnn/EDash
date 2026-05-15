import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { recordActivity } from "../lib/activityLog";
import { supabase } from "../lib/supabase";
import SubjectsView from "../views/subjects/SubjectsView";

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [bulkTeacher, setBulkTeacher] = useState("");
  const [form, setForm] = useState({
    name: "",
    room: "",
    teacher: "",
    color: "#8cae8a",
  });

  const loadSubjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("subjects").select("*").order("name");
      if (error) throw error;
      if (data) setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      setMessage("Could not load subjects.");
    } finally {
      setLoading(false);
    }
  }, [user]);

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
                if (current.some((subject) => subject.id === payload.new.id)) {
                  return current;
                }
                return [...current, payload.new].sort((a, b) => a.name.localeCompare(b.name));
              });
            } else if (payload.eventType === "UPDATE") {
              setSubjects((current) =>
                current.map((subject) => (subject.id === payload.new.id ? payload.new : subject))
              );
            } else if (payload.eventType === "DELETE") {
              setSubjects((current) =>
                current.filter((subject) => subject.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loadSubjects]);

  const handleCreateSubject = async () => {
    if (!form.name.trim() || !user) return;

    const normalizedName = form.name.trim().toLowerCase();
    const subjectExists = subjects.some(
      (subject) => subject.name.trim().toLowerCase() === normalizedName
    );

    if (subjectExists) {
      setMessage("A subject with this name already exists.");
      return;
    }

    let { data, error } = await supabase.rpc("create_subject_for_user", {
      name: form.name.trim(),
      room: form.room.trim() || null,
      color: form.color,
      teacher: form.teacher.trim() || null,
    });

    if (error) {
      console.warn("Retrying subject creation without teacher column:", error);
      const fallbackResult = await supabase.rpc("create_subject_for_user", {
        name: form.name.trim(),
        room: form.room.trim() || null,
        color: form.color,
      });
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error("Error creating subject:", error);
      setMessage("We couldn't save that subject yet. Please try again.");
      return;
    }

    await recordActivity({
      userId: user.id,
      action: "created",
      entityType: "subject",
      entityId: data?.id,
      description: `Created subject ${form.name.trim()}`,
      metadata: { name: form.name.trim(), room: form.room.trim(), teacher: form.teacher.trim() },
    });

    setForm({ name: "", room: "", teacher: "", color: "#8cae8a" });
    setMessage("");
    setIsDialogOpen(false);
  };

  const handleOpenEdit = (subject) => {
    setMessage("");
    setSelectedSubject(subject);
    setForm({
      name: subject.name,
      room: subject.room || "",
      teacher: subject.teacher || "",
      color: subject.color,
    });
    setIsEditDialogOpen(true);
  };

  const teacherOptions = subjects
    .map((subject) => subject.teacher?.trim())
    .filter(Boolean)
    .filter((teacher, index, teachers) => teachers.indexOf(teacher) === index)
    .sort((a, b) => a.localeCompare(b));

  const handleUpdateSubject = async () => {
    if (!form.name.trim() || !selectedSubject) return;

    const normalizedName = form.name.trim().toLowerCase();
    const subjectExists = subjects.some(
      (subject) =>
        subject.id !== selectedSubject.id && subject.name.trim().toLowerCase() === normalizedName
    );

    if (subjectExists) {
      setMessage("A subject with this name already exists.");
      return;
    }

    let savedTeacher = true;
    let { error } = await supabase
      .from("subjects")
      .update({
        name: form.name.trim(),
        room: form.room.trim() || null,
        teacher: form.teacher.trim() || null,
        color: form.color,
      })
      .eq("id", selectedSubject.id);

    if (error) {
      console.warn("Retrying subject update without teacher column:", error);
      savedTeacher = false;
      const fallbackResult = await supabase
        .from("subjects")
        .update({
          name: form.name.trim(),
          room: form.room.trim() || null,
          color: form.color,
        })
        .eq("id", selectedSubject.id);
      error = fallbackResult.error;
    }

    if (error) {
      console.error(error);
      setMessage("We couldn't update that subject.");
      return;
    }

    const updatedSubject = {
      ...selectedSubject,
      name: form.name.trim(),
      room: form.room.trim() || null,
      color: form.color,
      teacher: savedTeacher ? form.teacher.trim() || null : selectedSubject.teacher || null,
    };

    await recordActivity({
      userId: user.id,
      action: "updated",
      entityType: "subject",
      entityId: selectedSubject.id,
      description: `Updated subject ${form.name.trim()}`,
      metadata: { name: form.name.trim(), room: form.room.trim(), teacher: form.teacher.trim() },
    });

    setSubjects((current) =>
      current
        .map((subject) => (subject.id === selectedSubject.id ? updatedSubject : subject))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    if (!savedTeacher && form.teacher.trim() !== (selectedSubject.teacher || "")) {
      setSelectedSubject(updatedSubject);
      setMessage("Name, room, and color saved. Run the Supabase migration to save teachers.");
      return;
    }

    setSelectedSubject(null);
    setForm({ name: "", room: "", teacher: "", color: "#8cae8a" });
    setMessage("");
    setIsEditDialogOpen(false);
  };

  const handleOpenDelete = (subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const handleSelectionToggle = (subjectId) => {
    setSelectedSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((selectedId) => selectedId !== subjectId)
        : [...current, subjectId]
    );
  };

  const handleOpenTeacherDialog = () => {
    setMessage("");
    setBulkTeacher("");
    setIsTeacherDialogOpen(true);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedSubjectIds([]);
    setBulkTeacher("");
    setMessage("");
  };

  const handleAssignTeacher = async () => {
    if (selectedSubjectIds.length === 0) return;

    const teacher = bulkTeacher.trim();
    if (!teacher) {
      setMessage("Enter a teacher name first.");
      return;
    }

    const { error } = await supabase
      .from("subjects")
      .update({ teacher })
      .in("id", selectedSubjectIds);

    if (error) {
      console.error("Error assigning teacher:", error);
      setMessage("Run the Supabase migration first to save teachers.");
      return;
    }

    const selectedSubjects = subjects.filter((subject) => selectedSubjectIds.includes(subject.id));

    await recordActivity({
      userId: user.id,
      action: "updated",
      entityType: "subject",
      description: `Assigned ${teacher} to ${selectedSubjects.length} subjects`,
      metadata: {
        teacher,
        subject_ids: selectedSubjectIds,
        subject_names: selectedSubjects.map((subject) => subject.name),
      },
    });

    setSubjects((current) =>
      current.map((subject) =>
        selectedSubjectIds.includes(subject.id) ? { ...subject, teacher } : subject
      )
    );
    setSelectedSubjectIds([]);
    setBulkTeacher("");
    setIsTeacherDialogOpen(false);
    setIsSelectionMode(false);
    setMessage("");
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    const { error } = await supabase.from("subjects").delete().eq("id", selectedSubject.id);

    if (error) {
      console.error(error);
      setMessage("We couldn't delete that subject.");
      return;
    }

    await recordActivity({
      userId: user.id,
      action: "deleted",
      entityType: "subject",
      entityId: selectedSubject.id,
      description: `Deleted subject ${selectedSubject.name}`,
      metadata: { name: selectedSubject.name },
    });

    setSubjects((current) => current.filter((subject) => subject.id !== selectedSubject.id));
    setSelectedSubject(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <SubjectsView
      subjects={subjects}
      loading={loading}
      isDialogOpen={isDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      isDeleteDialogOpen={isDeleteDialogOpen}
      isTeacherDialogOpen={isTeacherDialogOpen}
      isSelectionMode={isSelectionMode}
      selectedSubject={selectedSubject}
      selectedSubjectIds={selectedSubjectIds}
      bulkTeacher={bulkTeacher}
      teacherOptions={teacherOptions}
      message={message}
      form={form}
      onOpenNew={() => {
        setMessage("");
        setIsDialogOpen(true);
      }}
      onStartTeacherAssignment={() => {
        setMessage("");
        setSelectedSubjectIds([]);
        setIsSelectionMode(true);
      }}
      onCancelSelection={handleCancelSelection}
      onOpenTeacherDialog={handleOpenTeacherDialog}
      onTeacherDialogClose={() => setIsTeacherDialogOpen(false)}
      onSelectedSubjectToggle={handleSelectionToggle}
      onBulkTeacherChange={setBulkTeacher}
      onAssignTeacher={handleAssignTeacher}
      onOpenEdit={handleOpenEdit}
      onOpenDelete={handleOpenDelete}
      onDialogClose={() => setIsDialogOpen(false)}
      onEditDialogClose={() => setIsEditDialogOpen(false)}
      onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
      onFormChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
      onCreate={handleCreateSubject}
      onUpdate={handleUpdateSubject}
      onDelete={handleDeleteSubject}
    />
  );
}
