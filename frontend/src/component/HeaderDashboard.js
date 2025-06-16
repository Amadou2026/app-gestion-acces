import React from 'react';
import { Navbar, Container, Button, Image } from 'react-bootstrap';
import { FiLogOut } from 'react-icons/fi';

// Remplace ce chemin par le bon si nécessaire
import logo from '../assets/logos/Ork1.png';

export default function HeaderDashboard({ onLogout }) {
  return (
    <Navbar bg="light" className="shadow-sm">
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Logo */}
        <Navbar.Brand className="d-flex align-items-center">
          <Image src={logo} alt="Logo" height="40" className="me-2" />
          <span className="fw-bold fs-5"></span>
        </Navbar.Brand>

        {/* Bouton Déconnexion */}
        <Button
          variant="outline-danger"
          onClick={onLogout}
          aria-label="Se déconnecter"
        >
          <FiLogOut className="me-2" />
          Déconnexion
        </Button>
      </Container>
    </Navbar>
  );
}
