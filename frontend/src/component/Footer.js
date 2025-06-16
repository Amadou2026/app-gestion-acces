import React from 'react'; 
import { Container, Row, Col, Image } from 'react-bootstrap';
import logo from '../assets/logos/Ork1.png';
import medianetLogo from '../assets/logos/logo-medianet.png';

export default function Footer() {
  return (
    <footer className="py-3 bg-light mt-auto">
      <Container>
        <Row className="align-items-center justify-content-between">
          <Col xs={6} md={4} className="d-flex align-items-center">
            <Image src={logo} alt="Logo" fluid style={{ maxHeight: '40px', marginRight: '10px' }} />
            <small className="text-secondary">Version 1.0</small>
          </Col>
          
          <Col xs={6} md={4} className="text-center text-secondary">
            <small>
              Powered by{' '}
              <a
                href="https://www.medianet.tn/fr"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <strong>MEDIANET - 2025</strong>
              </a>
            </small>
          </Col>
          
          <Col xs={12} md={4} className="text-md-end text-center mt-3 mt-md-0">
            <a
              href="https://www.medianet.tn/fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={medianetLogo}
                alt="Medianet Logo"
                fluid
                style={{ maxHeight: '40px' }}
              />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
