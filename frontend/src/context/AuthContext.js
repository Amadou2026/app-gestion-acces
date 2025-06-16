// src/context/AuthContext.js
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Tenter de récupérer les infos utilisateur en local
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        return;
      }

      // Sinon, fetch les infos depuis l'API
      fetch("http://localhost:8000/api/user-access/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erreur d'authentification");
          return res.json();
        })
        .then((data) => {
          // Extrait la rubrique principale depuis permissions (première rubrique)
          const permissions = data.permissions || [];
          let rubriquePrincipale = null;
          if (permissions.length > 0) {
            rubriquePrincipale = permissions[0].rubrique_slug;
          }

          const userData = {
            token,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            role: data.role,
            permissions: permissions,
            rubriquePrincipale,
          };

          setUser(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userData");
          setUser(null);
        });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
