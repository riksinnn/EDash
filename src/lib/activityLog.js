import { supabase } from "./supabase";

export async function recordActivity({
  userId,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) {
  if (!userId || !action || !entityType || !description) return;

  const { error } = await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    description,
    metadata,
  });

  if (error) {
    console.error("Error recording activity:", error);
  }
}
