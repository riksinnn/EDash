import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import AppLayout from "./components/layout/AppLayout";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

// A wrapper that checks if a user exists
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* Add other protected routes like /tasks or /schedule here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;