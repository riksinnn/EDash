import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-planner-olive">Welcome, Planner</h1>
        <p className="text-stone-500">{format(currentTime, 'PPPP p')}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Now Card */}
        <div className="bg-planner-olive text-white p-6 rounded-xl shadow-lg">
          <span className="text-xs uppercase tracking-widest opacity-80">Happening Now</span>
          <h2 className="text-2xl font-semibold mt-1">CS101: Systems Admin</h2>
          <p className="mt-2">Room 402 • Ends in 24 mins</p>
        </div>

        {/* Next Card */}
        <div className="bg-white border-2 border-planner-tan p-6 rounded-xl">
          <span className="text-xs uppercase tracking-widest text-stone-400">Up Next</span>
          <h2 className="text-2xl font-semibold mt-1 text-stone-700">Lunch Break</h2>
          <p className="mt-2 text-stone-500">Cafeteria • Starts at 12:00 PM</p>
        </div>
      </div>
    </div>
  );
}