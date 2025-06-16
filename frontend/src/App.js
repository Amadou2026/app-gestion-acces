import React, { useContext } from "react";
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
import "bootstrap/dist/css/bootstrap.min.css";

// PrivateRoute: affiche children si user connecté, sinon redirige vers /login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Chargement...</div>;
  }

  // Fonction pour définir la redirection après login
  const getRedirectAfterLogin = () => {
    if (!user) return "/login";
    if (user.role === "superadmin") return "/dashboard";
    if (user.rubriquePrincipale)
      return `/rubriques/${encodeURIComponent(user.rubriquePrincipale)}`;
    return "/dashboard";
  };

  // Redirection si on est à la racine "/"
  if (location.pathname === "/") {
    if (user) {
      return <Navigate to={getRedirectAfterLogin()} replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={getRedirectAfterLogin()} replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/rubriques/:rubriqueSlug"
        element={
          <PrivateRoute>
            <RubriquePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/rubriques/:rubriqueSlug/:sousRubriqueSlug"
        element={
          <PrivateRoute>
            <SousRubriquePage />
          </PrivateRoute>
        }
      />
      {/* Catch-all : redirige vers la page demandée si connecté, sinon login */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to={location.pathname} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
