import React, { useContext } from "react";
import HeaderDashboard from "../component/HeaderDashboard";
import Footer from "../component/Footer";
import Sidebar from "../component/Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function DashboardPage() {
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    // Redirection vers la page de login
    window.location.href = "/";
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <HeaderDashboard onLogout={handleLogout} />

      <div className="d-flex flex-grow-1">
        <aside
          className="bg-light border-end"
          style={{ width: "250px", minHeight: "calc(100vh - 56px - 56px)" }}
        >
          <Sidebar />
        </aside>

        <main className="flex-grow-1 container py-4">
          {/* <h2>Bienvenue, {user?.firstName} !</h2>
          <p>Rôle : {user?.role}</p> */}
          <div style={{ width: "100%", padding: "1rem", position: "relative" }}>
            <div
              style={{
                position: "relative",
                paddingBottom: "47.5%",
                height: 0,
                overflow: "hidden",
              }}
            >
              <iframe
                title="Dashboard Startup Village"
                src="https://app.powerbi.com/reportEmbed?reportId=90b45cc8-de7b-4e13-952b-88a82691897d&autoAuth=true&ctid=db6e7c35-4aaa-4d38-90d9-ec8a999df70c&navContentPaneEnabled=false&filterPaneEnabled=false&toolBarVisible=false"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "0",
                }}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
