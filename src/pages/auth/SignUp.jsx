import { Link } from "react-router-dom";
import SocialAuth from "../../components/auth/SocialAuth";
import { Button } from "../../components/ui/button";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-planner-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-planner-tan">
        <h2 className="text-3xl font-serif text-planner-olive font-bold mb-2">Join the Planner</h2>
        <p className="text-stone-500 mb-8">Create your account to start organizing.</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
            <input type="email" className="w-full p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-planner-olive" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input type="password" className="w-full p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-planner-olive" />
          </div>
          <Button className="w-full">Get Started</Button>
        </form>

        <div className="relative my-8 text-center">
          <hr className="border-stone-200" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-stone-400 uppercase tracking-widest">Or</span>
        </div>

        <SocialAuth />

        <p className="mt-8 text-center text-sm text-stone-500">
          Already a member? <Link to="/login" className="text-planner-olive font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}