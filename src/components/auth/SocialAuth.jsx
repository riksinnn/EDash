import { auth } from "../../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function SocialAuth() {
  const navigate = useNavigate();

  const handleGoogle = async () => {
    console.log("Attempting Google Sign-in..."); // Debug log
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Logged in as:", result.user.displayName); // Should show your name
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth Error Code:", error.code);
      console.error("Auth Error Message:", error.message);
      
      // Common error: auth/popup-blocked
      if (error.code === 'auth/popup-blocked') {
        alert("Please enable popups for this site to sign in with Google.");
      }
    }
  };

  return (
    <button 
      type="button" // Important: prevents form submission if inside a form
      onClick={handleGoogle}
      className="w-full flex items-center justify-center gap-3 border-2 border-stone-200 py-3 rounded-xl hover:bg-stone-50 transition-colors mt-4"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="w-5" />
      <span className="font-medium text-stone-700">Continue with Google</span>
    </button>
  );
}