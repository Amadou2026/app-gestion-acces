import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Ajout du loading

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);  // fini le chargement
        return;
      }

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
            permissions,
            rubriquePrincipale,
          };

          setUser(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
          setLoading(false);  // fini le chargement
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userData");
          setUser(null);
          setLoading(false);  // fini le chargement même en erreur
        });
    } else {
      setLoading(false);  // pas de token, fini le chargement
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
