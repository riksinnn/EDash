import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SignUpView from "../../views/auth/SignUpView";

const passwordRequirements = {
  minLength: { label: "At least 8 characters", regex: /.{8,}/ },
  hasUppercase: { label: "One uppercase letter (A-Z)", regex: /[A-Z]/ },
  hasLowercase: { label: "One lowercase letter (a-z)", regex: /[a-z]/ },
  hasNumber: { label: "One number (0-9)", regex: /\d/ },
};

export default function SignUp() {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    const checks = {
      minLength: passwordRequirements.minLength.regex.test(password),
      hasUppercase: passwordRequirements.hasUppercase.regex.test(password),
      hasLowercase: passwordRequirements.hasLowercase.regex.test(password),
      hasNumber: passwordRequirements.hasNumber.regex.test(password),
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    return {
      checks,
      passedCount,
      isValid: passedCount === 4,
      requirements: passwordRequirements,
    };
  }, [password]);

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      setMessage("Enter your name, email, and create a password.");
      return;
    }

    if (!passwordStrength.isValid) {
      setMessage("Your password doesn't meet all requirements.");
      return;
    }

    try {
      await signup(email.trim(), password, fullName.trim());
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setMessage("We couldn't create that account yet.");
    }
  };

  return (
    <SignUpView
      fullName={fullName}
      email={email}
      password={password}
      message={message}
      passwordStrength={passwordStrength}
      onFullNameChange={setFullName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSignUp}
    />
  );
}
