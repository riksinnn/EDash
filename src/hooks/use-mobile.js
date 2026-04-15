import { useEffect, useState } from "react";

export function useMobile(breakpoint = 768) {
  const getIsMobile = () => window.innerWidth < breakpoint;
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
