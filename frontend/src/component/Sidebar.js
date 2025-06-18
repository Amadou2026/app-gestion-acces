import React, { useContext, useEffect, useState } from "react";
import { Nav, Spinner, Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "../index.css";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Pas de token d'authentification");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/api/user-access/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API " + res.status);
        return res.json();
      })
      .then((json) => {
        setData(Array.isArray(json) ? json : json.rubriques || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="text-center py-3">
        <Spinner animation="border" variant="success" />
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" className="m-3">
        Erreur : {error}
      </Alert>
    );

  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? "d-flex align-items-center gap-2 rounded-pill active"
      : "d-flex align-items-center gap-2 rounded-pill";

  return (
    <div
      className="sidebar-container bg-success bg-opacity-50 rounded p-3"
      style={{ width: "240px" }}
    >
      <Nav className="flex-column" variant="pills">
        {/* {user?.role === "superadmin" && (
          <Nav.Item className="mb-3">
            <Nav.Link
              as={NavLink}
              to="/dashboard"
              className={getNavLinkClass}
              end
            >
              <span>Overview</span>
            </Nav.Link>
          </Nav.Item>
        )} */}

        {data.map(({ title, slug, sous_rubriques }) => (
          <Nav.Item key={slug} className="mb-2">
            <Nav.Link
              as={NavLink}
              to={`/rubriques/${encodeURIComponent(slug)}`}
              className={getNavLinkClass}
              end
            >
              <span>{title}</span>
            </Nav.Link>

            <Nav className="flex-column ms-4 mt-1">
              {sous_rubriques?.map(({ title: srTitle, slug: srSlug }) => (
                <Nav.Link
                  key={srSlug}
                  as={NavLink}
                  to={`/rubriques/${encodeURIComponent(slug)}/${encodeURIComponent(srSlug)}`}
                  className={getNavLinkClass}
                >
                  <span>{srTitle}</span>
                </Nav.Link>
              ))}
            </Nav>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
}