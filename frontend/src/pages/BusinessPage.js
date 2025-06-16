// src/pages/BusinessPage.js
import React from "react";

export default function BusinessPage() {
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
            <h1>Charges Fixes</h1>
            {/* Contenu spécifique à Charges Fixes */}
            <p>Ici vous pouvez ajouter le contenu lié aux business.</p>
          </main>
        </div>
        
        <Footer />
      </div>
    );
}
