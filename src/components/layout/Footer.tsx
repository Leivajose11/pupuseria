// src/components/layout/Footer.tsx
import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="footer-custom mt-auto py-3">
      <Container className="text-center text-light">
        <small>&copy; {new Date().getFullYear()} Pupusería Amparo | Todos los derechos reservados</small>
      </Container>
    </footer>
  );
}
