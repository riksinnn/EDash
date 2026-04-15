import { supabase } from "./supabase";

export async function syncFirebaseUserToSupabase(user) {
  if (!user) return;

  const payload = {
    firebase_uid: user.uid,
    email: user.email,
    display_name: user.displayName ?? null,
  };

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "firebase_uid" });

  if (error) {
    throw error;
  }
}
