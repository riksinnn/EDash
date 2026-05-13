import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import SubjectsView from "../views/subjects/SubjectsView";

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

  const handleOpenEdit = (subject) => {
    setMessage("");
    setSelectedSubject(subject);
    setForm({
      name: subject.name,
      room: subject.room || "",
      color: subject.color,
    });
    setIsEditDialogOpen(true);
  };

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

  const handleOpenDelete = (subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    const { error } = await supabase.from("subjects").delete().eq("id", selectedSubject.id);

    if (error) {
      console.error(error);
      setMessage("We couldn't delete that subject.");
      return;
    }

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
      selectedSubject={selectedSubject}
      message={message}
      form={form}
      onOpenNew={() => {
        setMessage("");
        setIsDialogOpen(true);
      }}
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
