import React from "react";
import HeaderDashboard from "../component/HeaderDashboard";
import Sidebar from "../component/Sidebar";
import Footer from "../component/Footer";

export default function RBEPage() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <HeaderDashboard />
      <div className="d-flex flex-grow-1">
        <aside
          className="bg-light border-end"
          style={{ width: "250px", minHeight: "calc(100vh - 56px - 56px)" }}
        >
          <Sidebar />
        </aside>
        <main className="flex-grow-1 container py-4">
          <h1>RBE</h1>
          <p>Contenu spécifique à la page RBE.</p>
        </main>
      </div>
      <Footer />
    </div>
  );
}
