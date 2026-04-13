// src/components/ui/sidebar.jsx
import { Link } from "react-router-dom";
import { LayoutDashboard, Calendar, CheckSquare, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Sidebar() { // Note the named export here
  const { logout } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <CheckSquare size={20} />, label: "Tasks", path: "/tasks" },
    { icon: <BookOpen size={20} />, label: "Subjects", path: "/subjects" },
    { icon: <Calendar size={20} />, label: "Schedule", path: "/schedule" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-planner-tan flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-serif font-bold text-planner-olive tracking-tight">Edash</h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-planner-cream hover:text-planner-olive rounded-lg transition-colors font-medium"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-100">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-stone-500 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}