import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router";
import { LoginPage } from "../components/layouts/login/LoginPage"; 
import { WorkspacePage } from "../pages/WorkspacePage";
import ProtectedRoute from "./ProtectedRoute";

function LoginRoute() {
  const navigate = useNavigate();
  return <LoginPage onLogin={() => navigate("/", { replace: true })} />;
}

export function AppRoutes() {
  return (
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        
        {/* Route 1: The Root page (Always starts a "New Chat") */}
        <Route 
          path="/" 
          element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} 
        />

        {/* Route 2: The Chat Session page (Loads a specific chat history) */}
        <Route 
          path="/c/:sessionId" 
          element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} 
        />
        
        {/* Catch-all route for invalid URLs */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}