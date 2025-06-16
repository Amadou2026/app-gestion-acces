// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, InputGroup, Image, Alert } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

import logo from '../assets/logos/logosv.png';
import HeaderLogin from '../component/HeaderLogin';
import Footer from '../component/Footer';

export default function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Échec de la connexion');
      }

      const data = await res.json();

      // Stocke les tokens (string)
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      // Stocke les permissions en JSON stringifié
      localStorage.setItem('permissions', JSON.stringify(data.permissions));

      // Extraire rubriquePrincipale depuis permissions
      let rubriquePrincipale = null;
      if (data.permissions && Array.isArray(data.permissions) && data.permissions.length > 0) {
        // suppose que chaque permission a un champ rubrique_slug ou similaire
        rubriquePrincipale = data.permissions[0].rubrique_slug || null;
      }

      // Appelle le context login avec les données utilisateur
      login({
        email: data.email,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        permissions: data.permissions, // objet / tableau
        token: data.access,
        rubriquePrincipale,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="d-flex flex-column vh-100">
      <HeaderLogin />
      <Container fluid className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={8} md={5} lg={4}>
            <div className="p-4 shadow bg-white text-center rounded">
              <Image src={logo} alt="Logo" width={100} height={100} className="mb-3 mx-auto d-block" />
              <h3 className="mb-4 fw-bold">Connexion</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Adresse email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="exemple@domaine.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Mot de passe</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 fw-semibold">
                  Se connecter
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}
