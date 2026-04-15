import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, variant = "default") => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 2400);
  };

  return { toast, showToast, clearToast: () => setToast(null) };
}
