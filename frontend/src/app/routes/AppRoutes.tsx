import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router";

// 1. Updated import path to match your new modular login folder!
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
        
        <Route path="/" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
        {/* <Route path="/auth/success" element={<AuthSuccess />} /> */}
        
        {/* Catch-all route for invalid URLs */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}