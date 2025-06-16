import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
// Import de ton logo local, adapte le chemin
import logo from '../assets/logos/Ork1.png';

export default function HeaderLogin() {
  return (
    <header className="py-3  bg-white">
      <Container>
        <Row className="align-items-center">
          <Col xs={3} md={2}>
            <Image src={logo} alt="Logo" fluid style={{ maxHeight: '50px' }} />
          </Col>
          <Col xs={9} md={10}>
            <h5 className="mb-0 text-secondary">
              Orchestrer votre patrimoine digital avec une vision 360°
            </h5>
          </Col>
        </Row>
      </Container>
    </header>
  );
}
