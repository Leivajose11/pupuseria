import { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Perfil {
  id: number;
  nombre: string;
  usuario: string;
  rol: string;
  activo: boolean;
  fechaRegistro: string;
}

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [actualPassword, setActualPassword] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get('/auth/perfil');
        setPerfil(res.data);
        setNuevoNombre(res.data.nombre);
        setCargando(false);
      } catch (err: any) {
        console.error('Error al obtener perfil:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
    fetchPerfil();
  }, [navigate]);

  const mostrarMensaje = (tipo: 'success' | 'danger', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const guardarCambios = async () => {
    if (!nuevoNombre.trim()) {
      mostrarMensaje('danger', 'El nombre no puede estar vacío');
      return;
    }

    if (nuevaPassword && !actualPassword) {
      mostrarMensaje('danger', 'Debes ingresar la contraseña actual para cambiarla');
      return;
    }

    try {
      await axios.put('/auth/perfil', {
        nombre: nuevoNombre,
        actualPassword,
        nuevaPassword
      });
      mostrarMensaje('success', 'Perfil actualizado correctamente');
      setActualPassword('');
      setNuevaPassword('');
    } catch (err: any) {
      const mensaje = err.response?.data?.mensaje || 'Error al actualizar perfil';
      mostrarMensaje('danger', mensaje);
    }
  };

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Mi Perfil</h2>

      {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control type="text" value={perfil?.usuario} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Control type="text" value={perfil?.rol} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control type="text" value={perfil?.activo ? 'Activo' : 'Inactivo'} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de registro</Form.Label>
              <Form.Control
                type="text"
                value={new Date(perfil?.fechaRegistro || '').toLocaleString()}
                disabled
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña actual</Form.Label>
              <Form.Control
                type="password"
                value={actualPassword}
                onChange={e => setActualPassword(e.target.value)}
                placeholder="Solo si deseas cambiarla"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                value={nuevaPassword}
                onChange={e => setNuevaPassword(e.target.value)}
                placeholder="Deja vacío si no deseas cambiarla"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" onClick={guardarCambios}>
          Guardar Cambios
        </Button>
      </Form>
    </Container>
  );
}
