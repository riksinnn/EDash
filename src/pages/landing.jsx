import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-planner-cream flex flex-col items-center justify-center p-6 text-center">
      {/* Decorative Element */}
      <div className="w-20 h-1 bg-planner-olive mb-8 rounded-full"></div>
      
      <h1 className="text-5xl md:text-7xl font-serif text-planner-olive font-bold mb-4">
        Edash
      </h1>
      <p className="text-stone-600 text-lg md:text-xl max-w-md mb-8 leading-relaxed">
        Master your schedule, conquer your tasks. The digital leather planner for the modern student.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate("/signup")}>
          Start Planning
        </Button>
        <Button variant="outline" onClick={() => navigate("/login")}>
          Log In
        </Button>
      </div>

      <footer className="mt-20 text-stone-400 text-sm uppercase tracking-widest">
        Built for University Excellence
      </footer>
    </div>
  );
}