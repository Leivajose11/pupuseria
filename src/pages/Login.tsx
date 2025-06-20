import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import logo from '../assets/Logo.png';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async () => {
    try {
      const respuesta = await axios.post('http://localhost:4000/api/auth/login', {
        usuario,
        password,
      });

      const data = respuesta.data;

      if (data?.rol && data?.nombre && data?.id) {
        sessionStorage.setItem('logueado', 'true');
        sessionStorage.setItem('rol', data.rol);
        sessionStorage.setItem('nombre', data.nombre);
        sessionStorage.setItem('usuarioId', data.id.toString());
        navigate('/');
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manejarLogin();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `repeating-linear-gradient(
          45deg,
          rgba(255,255,255,0.05) 0,
          rgba(255,255,255,0.05) 1px,
          transparent 1px,
          transparent 40px
        ), url(${logo})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px',
        backgroundPosition: 'center',
        backdropFilter: 'blur(1px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420 }} className="shadow p-4 bg-white bg-opacity-90 rounded">
        <div className="text-center mb-4">
          <img src={logo} alt="Pupusería Logo" style={{ height: '210px' }} />
        </div>
        <h3 className="text-center mb-3">Iniciar sesión</h3>
        <Form onSubmit={manejarSubmit}>
          <Form.Group className="mb-3" controlId="usuario">
            <Form.Control
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" type="submit">
              Ingresar
            </Button>
          </div>
        </Form>
        {error && <Alert variant="danger" className="mt-3 text-center">{error}</Alert>}
      </Card>
    </div>
  );
}
