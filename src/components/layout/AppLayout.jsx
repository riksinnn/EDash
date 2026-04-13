import { Sidebar } from "../ui/sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-planner-cream text-stone-800">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}