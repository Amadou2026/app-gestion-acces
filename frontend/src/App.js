import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RubriquePage from "./pages/RubriquesPage";
import SousRubriquePage from "./pages/SousRubriquePage";

import { AuthContext } from "./context/AuthContext";
import AssistantOverlay from "./component/AssistantOverlay";
import "bootstrap/dist/css/bootstrap.min.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  const [showAssistant, setShowAssistant] = useState(false); // 👈 global assistant
  const shouldHideAssistant = location.pathname === "/login"; // ⛔️ pas sur /login

  if (loading) return <div>Chargement...</div>;

  const getRedirectAfterLogin = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/dashboard";
    if (user.rubriquePrincipale)
      return `/rubriques/${encodeURIComponent(user.rubriquePrincipale)}`;
    return "/dashboard";
  };

  if (location.pathname === "/") {
    return user
      ? <Navigate to={getRedirectAfterLogin()} replace />
      : <Navigate to="/login" replace />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={getRedirectAfterLogin()} replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/rubriques/:rubriqueSlug"
          element={<PrivateRoute><RubriquePage /></PrivateRoute>}
        />
        <Route
          path="/rubriques/:rubriqueSlug/:sousRubriqueSlug"
          element={<PrivateRoute><SousRubriquePage /></PrivateRoute>}
        />
        <Route
          path="*"
          element={user
            ? <Navigate to={location.pathname} replace />
            : <Navigate to="/login" replace />}
        />
      </Routes>

      {/* ✅ Assistant toujours présent sauf sur /login */}
      {user && !shouldHideAssistant && (
        <>
          {showAssistant && (
            <AssistantOverlay onClose={() => setShowAssistant(false)} />
          )}

          <button
            onClick={() => setShowAssistant(true)}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              fontSize: "24px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              zIndex: 9999,
            }}
            title="Ouvrir l'assistant"
          >
            💬
          </button>
        </>
      )}
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
