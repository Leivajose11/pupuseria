import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, Button, Modal, Row, Col, Alert } from 'react-bootstrap';

interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  rol: string;
  idRol: number;
  activo: boolean;
  fechaRegistro: string;
}

interface Rol {
  id: number;
  nombre: string;
}

export default function Register() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [rolActual, setRolActual] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Usuario> & { password?: string }>({});
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  const usuarioResponsableId = Number(sessionStorage.getItem('usuarioId'));

  useEffect(() => {
    const rol = sessionStorage.getItem('rol');
    if (rol) setRolActual(rol);
    if (rol === 'Administrador') {
      cargarUsuarios();
      cargarRoles();
    }
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/auth/usuarios');
      setUsuarios(res.data);
    } catch {
      mostrarMensaje('danger', 'Error al cargar usuarios');
    }
  };

  const cargarRoles = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/auth/roles');
      setRoles(res.data);
    } catch {
      mostrarMensaje('danger', 'Error al cargar roles');
    }
  };

  const abrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setFormData({ ...usuario, password: '' });
      setModoEdicion(true);
    } else {
      setFormData({ activo: true });
      setModoEdicion(false);
    }
    setErrores({});
    setShowModal(true);
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!formData.nombre) err.nombre = 'Nombre requerido';
    if (!formData.usuario) err.usuario = 'Usuario requerido';
    if (!formData.idRol) err.idRol = 'Rol requerido';
    if (!modoEdicion && !formData.password) err.password = 'Contraseña requerida';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const guardarUsuario = async () => {
    if (!validar()) return;

    try {
      const payload = { ...formData, usuarioResponsableId };
      if (modoEdicion && formData.id) {
        await axios.put(`http://localhost:4000/api/auth/usuarios/${formData.id}`, payload);
        mostrarMensaje('success', 'Usuario actualizado correctamente');
      } else {
        await axios.post('http://localhost:4000/api/auth/register', payload);
        mostrarMensaje('success', 'Usuario registrado correctamente');
      }
      setShowModal(false);
      cargarUsuarios();
    } catch {
      mostrarMensaje('danger', 'Error al guardar usuario');
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario permanentemente?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/auth/usuarios/${id}`, {
        data: { usuarioResponsableId },
      });
      mostrarMensaje('success', 'Usuario eliminado');
      cargarUsuarios();
    } catch {
      mostrarMensaje('danger', 'Error al eliminar usuario');
    }
  };

  const desactivarUsuario = async (id: number) => {
    try {
      await axios.patch(`http://localhost:4000/api/auth/usuarios/${id}/desactivar`, { usuarioResponsableId });
      mostrarMensaje('success', 'Usuario desactivado');
      cargarUsuarios();
    } catch {
      mostrarMensaje('danger', 'Error al desactivar usuario');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mostrarMensaje = (tipo: 'success' | 'danger', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  if (rolActual !== 'Administrador') {
    return <div className="p-4 text-danger">Acceso denegado: Solo administradores.</div>;
  }

  return (
    <div className="container mt-3">
      <h1 className="mb-4">Gestión de Usuarios</h1>

      {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={6} className="text-end">
          <Button variant="success" onClick={() => abrirModal()}>
            ➕ Nuevo Usuario
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Fecha de Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(u => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.usuario}</td>
              <td>{u.rol}</td>
              <td>{u.activo ? '✅' : '❌'}</td>
              <td>{new Date(u.fechaRegistro).toLocaleDateString()}</td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => abrirModal(u)}>✏️</Button>
                <Button size="sm" variant="danger" className="me-2" onClick={() => eliminarUsuario(u.id)}>🗑️</Button>
                <Button size="sm" variant="secondary" onClick={() => desactivarUsuario(u.id)}>🚫</Button>
              </td>
            </tr>
          ))}
          {usuariosFiltrados.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted">No se encontraron usuarios.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal Formulario */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Editar usuario' : 'Nuevo usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              value={formData.nombre || ''}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              isInvalid={!!errores.nombre}
            />
            <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              value={formData.usuario || ''}
              onChange={e => setFormData({ ...formData, usuario: e.target.value })}
              isInvalid={!!errores.usuario}
            />
            <Form.Control.Feedback type="invalid">{errores.usuario}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              value={formData.idRol || ''}
              onChange={e => setFormData({ ...formData, idRol: Number(e.target.value) })}
              isInvalid={!!errores.idRol}
            >
              <option value="">Seleccione...</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.idRol}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={formData.password || ''}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              isInvalid={!!errores.password}
              placeholder={modoEdicion ? 'Dejar en blanco para no cambiar' : ''}
            />
            <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
          </Form.Group>

          {modoEdicion && (
            <Form.Group className="mb-3">
              <Form.Check
                label="Activo"
                checked={formData.activo ?? true}
                onChange={e => setFormData({ ...formData, activo: e.target.checked })}
              />
            </Form.Group>
          )}

          {modoEdicion && formData.fechaRegistro && (
            <div className="mb-2 text-muted">
              Fecha de registro: {new Date(formData.fechaRegistro).toLocaleString()}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={guardarUsuario}>
            {modoEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
