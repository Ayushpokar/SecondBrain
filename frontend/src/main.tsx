import ReactDOM from "react-dom/client";
import { AppRoutes } from "./app/routes/AppRoutes";
import { AuthProvider } from "./app/context/AuthContext";
import { BrowserRouter } from "react-router";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes /> 
    </AuthProvider>
  </BrowserRouter>
);