import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function SocialAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogle = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      // Supabase will handle redirect automatically
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#ddd4c3] bg-[#fbf9f4] px-5 py-3 text-[#354737] shadow-[0_8px_24px_rgba(127,117,96,0.08)] transition hover:bg-[#f3efe6] disabled:opacity-50"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg"
        alt="Google"
        className="w-5"
      />
      <span className="text-base font-semibold">{isLoading ? "Signing in..." : "Continue with Google"}</span>
    </button>
  );
}
