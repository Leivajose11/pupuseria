// C:\Users\Leiva\pupuseria\src\pages\Register.tsx

import { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // ✅ correcto: usa la instancia de axios configurada

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
  const [rolActual, setRolActual] = useState(''); // Estado para almacenar el rol del usuario logueado
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState<Partial<Usuario> & { password?: string }>({});
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  // Ya NO necesitamos obtener usuarioResponsableId de localStorage/sessionStorage aquí
  // const usuarioResponsableId = Number(sessionStorage.getItem('usuarioId')); // Esta línea se vuelve innecesaria

  useEffect(() => {
    // Usamos localStorage para el rol, ya que lo cambiamos en Login.tsx
    const rol = localStorage.getItem('rol'); 
    if (rol) setRolActual(rol); // Guardamos el rol en el estado
    
    // Solo cargamos si es administrador
    if (rol && rol.toLowerCase() === 'administrador') { // Comparamos en minúsculas
      cargarUsuarios();
      cargarRoles();
    } else {
      // Si no es administrador, podemos mostrar un mensaje o redirigir
      setUsuarios([]); // Aseguramos que la lista esté vacía
      setMensaje({ tipo: 'danger', texto: 'Acceso denegado: Solo administradores pueden gestionar usuarios.' });
    }
  }, []); // El array de dependencias está vacío porque estas acciones solo ocurren una vez al montar

  const cargarUsuarios = async () => {
    try {
      // axiosConfig.ts ya añade el token y el rol en los headers
      const res = await axios.get('/auth/usuarios'); // Usamos la ruta relativa definida en baseURL
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      mostrarMensaje('danger', 'Error al cargar usuarios. Asegúrate de tener permisos.');
    }
  };

  const cargarRoles = async () => {
    try {
      // axiosConfig.ts ya añade el token y el rol en los headers
      const res = await axios.get('/auth/roles'); // Usamos la ruta relativa
      setRoles(res.data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      mostrarMensaje('danger', 'Error al cargar roles. Asegúrate de tener permisos.');
    }
  };

  const abrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setFormData({ ...usuario, password: '' });
      setModoEdicion(true);
    } else {
      setFormData({ activo: true, idRol: undefined }); // Reiniciar idRol para nuevos usuarios
      setModoEdicion(false);
    }
    setErrores({}); // Limpiar errores al abrir el modal
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setErrores({});
    setFormData({}); // Limpiar formData al cerrar el modal
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!formData.nombre) err.nombre = 'Nombre requerido';
    if (!formData.usuario) err.usuario = 'Usuario requerido';
    if (!formData.idRol) err.idRol = 'Rol requerido';
    // La contraseña es requerida solo para nuevos usuarios
    if (!modoEdicion && !formData.password) err.password = 'Contraseña requerida'; 
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const guardarUsuario = async () => {
    if (!validar()) return;

    try {
      // Preparamos el payload sin usuarioResponsableId
      const payload: Partial<Usuario> & { password?: string } = { ...formData };
      
      // Eliminamos propiedades que no deben enviarse al backend en el payload
      delete payload.rol; 
      delete payload.fechaRegistro; 
      delete payload.id; // Para nuevos usuarios, el ID no se envía

      if (modoEdicion && formData.id) {
        // Actualizar usuario existente
        await axios.put(`/auth/usuarios/${formData.id}`, payload);
        mostrarMensaje('success', 'Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        await axios.post('/auth/register', payload);
        mostrarMensaje('success', 'Usuario registrado correctamente');
      }
      cerrarModal(); // Cerrar modal usando la nueva función
      cargarUsuarios(); // Volver a cargar la lista de usuarios para ver los cambios
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      const mensajeError = error.response?.data?.mensaje || 'Error desconocido al guardar usuario.';
      mostrarMensaje('danger', mensajeError);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario permanentemente? Esta acción es irreversible.')) return;
    try {
      // No necesitamos enviar 'data: { usuarioResponsableId }'
      await axios.delete(`/auth/usuarios/${id}`);
      mostrarMensaje('success', 'Usuario eliminado');
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      const mensajeError = error.response?.data?.mensaje || 'Error desconocido al eliminar usuario.';
      mostrarMensaje('danger', mensajeError);
    }
  };

  const handleToggleActive = async (id: number, activo: boolean) => {
    const action = activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de que quieres ${action} a este usuario?`)) return;
    
    try {
      // No necesitamos enviar 'usuarioResponsableId' en el cuerpo
      await axios.patch(`/auth/usuarios/${id}/${action}`);
      mostrarMensaje('success', `Usuario ${activo ? 'desactivado' : 'activado'} con éxito`);
      cargarUsuarios();
    } catch (error: any) {
      console.error(`Error al ${action} usuario:`, error);
      const mensajeError = error.response?.data?.mensaje || `Error desconocido al ${action} usuario.`;
      mostrarMensaje('danger', mensajeError);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  const mostrarMensaje = (tipo: 'success' | 'danger', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000); // El mensaje desaparece después de 3 segundos
  };

  // Aseguramos que solo el administrador vea la tabla
  if (rolActual.toLowerCase() !== 'administrador') {
    return (
      <div className="p-4 text-center">
        <Alert variant="danger">Acceso denegado: Solo los administradores tienen permiso para gestionar usuarios.</Alert>
      </div>
    );
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
              <td>{new Date(u.fechaRegistro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => abrirModal(u)}>✏️</Button>
                <Button size="sm" variant="danger" className="me-2" onClick={() => eliminarUsuario(u.id)}>🗑️</Button>
                {/* Botón para activar/desactivar */}
                <Button 
                  size="sm" 
                  variant={u.activo ? 'secondary' : 'info'} // Cambia el color si está activo/inactivo
                  onClick={() => handleToggleActive(u.id, u.activo)}
                >
                  {u.activo ? '🚫 Desactivar' : '✅ Activar'}
                </Button>
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
      <Modal show={showModal} onHide={cerrarModal}> {/* Usamos la nueva función cerrarModal */}
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
                checked={formData.activo ?? true} // Usa ?? para un valor por defecto si es null/undefined
                onChange={e => setFormData({ ...formData, activo: e.target.checked })}
              />
            </Form.Group>
          )}

          {modoEdicion && formData.fechaRegistro && (
            <div className="mb-2 text-muted">
              Fecha de registro: {new Date(formData.fechaRegistro).toLocaleString('es-ES')}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>Cancelar</Button> {/* Usamos la nueva función cerrarModal */}
          <Button variant="primary" onClick={guardarUsuario}>
            {modoEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}