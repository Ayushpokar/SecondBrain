import ReactDOM from "react-dom/client";

import { AppRoutes } from "./app/routes/AppRoutes";
import { AuthProvider } from "./app/context/AuthContext";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes /> 
    </AuthProvider>
  </BrowserRouter>
);