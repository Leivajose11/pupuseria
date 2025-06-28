import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
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
  FaShieldAlt,
  FaUtensils,
  FaClipboardList,
  FaMoneyBillWave,
  FaTools,
  FaCogs,
  FaUserShield,
  FaClipboardCheck
} from 'react-icons/fa';
import { FaPerson } from 'react-icons/fa6';

export default function AppNavbar() {
  const navigate = useNavigate();
  const rol = sessionStorage.getItem('rol');
  const nombre = sessionStorage.getItem('nombre');
  const logueado = sessionStorage.getItem('logueado') === 'true';

  const cerrarSesion = () => {
    sessionStorage.clear();
    navigate('/login');
  };

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
            {logueado && (
              <>
                <Nav.Link as={Link} to="/"><FaHome className="me-1" />Inicio</Nav.Link>

                {(rol === 'Administrador' || rol === 'Cajero') && (
                  <>
                    <Nav.Link as={Link} to="/caja"><FaCashRegister className="me-1" />Caja</Nav.Link>
                    <Nav.Link as={Link} to="/gastos"><FaMoneyBillWave className="me-1" />Gastos</Nav.Link>
                  </>
                )}

                <Nav.Link as={Link} to="/menu"><FaUtensils className="me-1" />Menú</Nav.Link>

                {(rol !== 'Cocinero') && (
                  <Nav.Link as={Link} to="/bebidas"><FaGlassCheers className="me-1" />Bebidas</Nav.Link>
                )}

                <Nav.Link as={Link} to="/inventario"><FaBoxOpen className="me-1" />Inventario</Nav.Link>

                {(rol === 'Administrador' || rol === 'Cajero' || rol === 'Cocinero' || rol === 'Mesero') && (
                  <Nav.Link as={Link} to="/ordenes"><FaClipboardCheck className="me-1" />Órdenes</Nav.Link>
                )}

                {rol === 'Administrador' && (
                  <>
                    <NavDropdown title={<><FaTools className="me-1" />Admin</>} id="admin-dropdown">
                      <NavDropdown.Item as={Link} to="/empleados">
                        <FaUsers className="me-2" />Empleados
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/clientes">
                        <FaPerson className="me-2" />Clientes
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/proveedores">
                        <FaTruck className="me-2" />Proveedores
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/reportes">
                        <FaChartBar className="me-2" />Reportes
                      </NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title={<><FaCogs className="me-1" />Configuración</>} id="configuracion-dropdown">
                      <NavDropdown.Item as={Link} to="/Register">
                        <FaUserShield className="me-2" />Usuarios y Roles
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/seguridad">
                        <FaShieldAlt className="me-2" />Seguridad / Respaldo
                      </NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/auditoria">
                        <FaClipboardList className="me-2" />Auditoría
                      </NavDropdown.Item>
                    </NavDropdown>
                  </>
                )}
              </>
            )}
          </Nav>

          {logueado && (
            <Nav>
              <NavDropdown
                title={<><FaUser className="me-1" />{nombre || 'Usuario'}</>}
                id="usuario-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/perfil">
                  <FaUser className="me-2" />Mi perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={cerrarSesion}>
                  <FaSignOutAlt className="me-2" />Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
