import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaBoxOpen,
  FaCashRegister,
  FaUsers,
  FaChartBar,
  FaTruck,
  FaGlassCheers,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaKey,
  FaShieldAlt
} from 'react-icons/fa';

export default function AppNavbar() {
  return (
    <Navbar className="navbar-custom" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/src/assets/logo.png"
            alt="Pupusería Logo"
            height="60"
            className="d-inline-block align-top me-2"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/"><FaHome className="me-1" />Inicio</Nav.Link>
            <Nav.Link as={Link} to="/inventario"><FaBoxOpen className="me-1" />Inventario</Nav.Link>
            <Nav.Link as={Link} to="/caja"><FaCashRegister className="me-1" />Caja</Nav.Link>
            <Nav.Link as={Link} to="/empleados"><FaUsers className="me-1" />Empleados</Nav.Link>
            <Nav.Link as={Link} to="/reportes"><FaChartBar className="me-1" />Reportes</Nav.Link>
            <Nav.Link as={Link} to="/proveedores"><FaTruck className="me-1" />Proveedores</Nav.Link>
            <Nav.Link as={Link} to="/bebidas"><FaGlassCheers className="me-1" />Control Bebidas</Nav.Link>

            <NavDropdown title={<><FaCog className="me-1" />Configuración</>} id="configuracion-dropdown">
              <NavDropdown.Item as={Link} to="/configuracion/accesos">
                <FaKey className="me-2" />Accesos por roles
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/configuracion/seguridad">
                <FaShieldAlt className="me-2" />Seguridad / Respaldo
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Nav>
            <NavDropdown title={<><FaUser className="me-1" />Usuario</>} id="usuario-dropdown" align="end">
              <NavDropdown.Item as={Link} to="/perfil"><FaUser className="me-2" />Mi perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/logout"><FaSignOutAlt className="me-2" />Cerrar sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
