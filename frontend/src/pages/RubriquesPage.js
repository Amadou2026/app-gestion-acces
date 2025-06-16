import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderDashboard from "../component/HeaderDashboard";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";
import { AuthContext } from "../context/AuthContext";

export default function RubriquePage() {
  const { rubriqueSlug } = useParams();
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rubriquePowerbiUrl, setRubriquePowerbiUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchAccess = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch("http://localhost:8000/api/user-access/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Erreur d’accès aux données");

        const accessData = await res.json();
        const rubrique = accessData.find((item) => item.slug === rubriqueSlug);

        if (rubrique?.rubrique_powerbi_url) {
          setRubriquePowerbiUrl(rubrique.rubrique_powerbi_url);
        } else {
          setRubriquePowerbiUrl(null);
        }

      } catch (err) {
        console.error("Erreur lors du chargement de l'accès utilisateur", err);
        setRubriquePowerbiUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [rubriqueSlug]);

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
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p>Chargement en cours...</p>
            </div>
          ) : rubriquePowerbiUrl ? (
            <iframe
              title={`Dashboard ${rubriqueSlug}`}
              src={rubriquePowerbiUrl}
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
            <div className="d-flex justify-content-center align-items-center h-100">
              <h4>Aucun rapport Power BI disponible pour cette rubrique.</h4>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
