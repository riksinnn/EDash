import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SettingsView from "../views/settings/SettingsView";

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <SettingsView
      user={user}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      onSubjects={() => navigate("/subjects")}
      onSecurity={() => navigate("/security")}
      onAbout={() => navigate("/about")}
      onLogout={() => navigate("/logout")}
    />
  );
}
