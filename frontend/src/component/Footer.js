import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
// Import de ton logo local, adapte le chemin
import logo from '../assets/logos/Ork2.png';

export default function Footer() {
  return (
    <footer className="py-3  bg-light mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col xs={3} md={2}>
            <Image src={logo} alt="Logo" fluid style={{ maxHeight: '40px' }} />
          </Col>
          <Col xs={9} md={10} className="text-secondary">
            <small>
              Version 1.0 &nbsp; | &nbsp; Powered by <strong>Medianet - 2025</strong>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
