import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderDashboard from "../component/HeaderDashboard";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import { AuthContext } from "../context/AuthContext";

export default function RubriquePage() {
  const { rubriqueSlug } = useParams();
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Recherche de l'URL Power BI à partir des permissions utilisateur
  const permission = user?.permissions?.find(
    (perm) => perm.rubrique_slug === rubriqueSlug
  );

  const srcIframe = permission?.rubrique_powerbi_url || "https://app.powerbi.com"; // URL par défaut si non trouvée

  return (
    <div className="d-flex flex-column min-vh-100">
      <HeaderDashboard onLogout={handleLogout} />

      <div className="d-flex flex-grow-1" style={{ position: "relative" }}>
        <aside
          className="bg-light border-end"
          style={{
            width: "250px",
            minHeight: "calc(100vh - 56px - 56px)",
            zIndex: 10,
          }}
        >
          <Sidebar />
        </aside>

        <main
          className="flex-grow-1"
          style={{
            position: "relative",
            height: "calc(100vh - 56px - 56px)",
            overflow: "hidden",
          }}
        >
          <iframe
            title={`Dashboard ${rubriqueSlug}`}
            src={srcIframe}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              zIndex: 1,
            }}
            allowFullScreen
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}
