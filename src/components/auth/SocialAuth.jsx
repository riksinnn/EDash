import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";

export default function SocialAuth() {
  const navigate = useNavigate();

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      if (error.code === "auth/popup-blocked") {
        alert("Please enable popups for this site to continue with Google.");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#ddd4c3] bg-[#fbf9f4] px-5 py-3 text-[#354737] shadow-[0_8px_24px_rgba(127,117,96,0.08)] transition hover:bg-[#f3efe6]"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg"
        alt="Google"
        className="w-5"
      />
      <span className="text-base font-semibold">Continue with Google</span>
    </button>
  );
}
