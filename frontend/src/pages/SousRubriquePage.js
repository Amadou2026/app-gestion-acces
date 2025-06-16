import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderDashboard from "../component/HeaderDashboard";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import { AuthContext } from "../context/AuthContext";

export default function SousRubriquePage() {
  const { rubriqueSlug, sousRubriqueSlug } = useParams();
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Recherche l'accès utilisateur correspondant à la rubrique + sous-rubrique
  const permission = user?.permissions?.find(
    (perm) =>
      perm.rubrique_slug === rubriqueSlug &&
      perm.sous_rubrique_slug === sousRubriqueSlug
  );

  const srcIframe = permission?.sous_rubrique_powerbi_url || null;

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
          {srcIframe ? (
            <iframe
              title={`Dashboard ${rubriqueSlug} - ${sousRubriqueSlug}`}
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
          ) : (
            <div className="p-4">
              <h3>Rapport non disponible</h3>
              <p>
                Le rapport pour la rubrique{" "}
                <strong>{rubriqueSlug.replace(/_/g, " ")}</strong> et la
                sous-rubrique{" "}
                <strong>{sousRubriqueSlug.replace(/_/g, " ")}</strong> n'est pas disponible.
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
