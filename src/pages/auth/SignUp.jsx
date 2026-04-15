import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import SocialAuth from "../../components/auth/SocialAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Enter your email and create a password.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("We couldn’t create that account yet.");
    }
  };

  return (
    <AuthShell
      eyebrow="Join the Planner"
      title="Create your account."
      subtitle="Start building your schedule, class tracker, and task flow in one calm workspace."
      footer={
        <p className="text-sm text-[var(--text-secondary)]">
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-[var(--accent)]">
            Log in
          </Link>
        </p>
      }
    >
      <SocialAuth />

      <div className="relative my-6 text-center">
        <div className="border-t border-[var(--app-border)]" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[var(--app-panel)] px-4 text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Or
        </span>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="name@school.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Password
          </label>
          <Input
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          Get Started
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </AuthShell>
  );
}

function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[image:var(--landing-gradient)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-6xl font-semibold leading-[0.96] text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="mt-5 max-w-md text-xl leading-relaxed text-[var(--text-secondary)]">
              {subtitle}
            </p>
          </section>

          <section className="rounded-[30px] border border-[var(--app-border)] bg-[var(--app-panel)] p-8 shadow-[var(--shadow-card)]">
            {children}
            <div className="mt-8">{footer}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
