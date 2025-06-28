// src/pages/Menu.tsx
import { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // usa token desde sessionStorage automáticamente
import { Table, Form, Button, Modal, Row, Col, Alert } from 'react-bootstrap';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
  idCategoria: number;
  categoria: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

export default function Menu() {
  const [menu, setMenu] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState(() => localStorage.getItem('busquedaMenu') || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(() => localStorage.getItem('catSeleccionada') || '');
  const [ordenColumna, setOrdenColumna] = useState(() => localStorage.getItem('ordenColumna') || 'nombre');
  const [ordenAscendente, setOrdenAscendente] = useState(() => localStorage.getItem('ordenAscendente') !== 'false');
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<Producto | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Producto>>({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);

  const rol = (sessionStorage.getItem('rol') || '').toLowerCase();
  const esAdmin = rol === 'administrador';

  useEffect(() => {
    cargarMenu();
    cargarCategorias();
  }, []);

  const cargarMenu = async () => {
    try {
      const res = await axios.get('/menu');
      setMenu(res.data);
    } catch {
      mostrarMensaje('danger', 'Error al cargar el menú');
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await axios.get('/categorias');
      setCategorias(res.data);
    } catch {
      mostrarMensaje('danger', 'Error al cargar categorías');
    }
  };

  const abrirModal = (producto?: Producto) => {
    setModoEdicion(!!producto);
    setFormData(producto || { disponible: true });
    setErrores({});
    setShowModal(true);
  };

  const validar = () => {
    const err: { [key: string]: string } = {};
    if (!formData.nombre?.trim()) err.nombre = 'Nombre es requerido';
    if (!formData.descripcion?.trim()) err.descripcion = 'Descripción es requerida';
    if (formData.precio === undefined || isNaN(Number(formData.precio))) err.precio = 'Precio inválido';
    if (!formData.idCategoria) err.idCategoria = 'Seleccione una categoría';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const guardarProducto = async () => {
    if (!validar()) return;
    try {
      if (modoEdicion && formData.id) {
        await axios.put(`/menu/${formData.id}`, formData);
        mostrarMensaje('success', 'Producto actualizado correctamente');
      } else {
        await axios.post('/menu', formData);
        mostrarMensaje('success', 'Producto agregado correctamente');
      }
      setShowModal(false);
      cargarMenu();
    } catch (error: any) {
      const mensaje = error?.response?.data?.mensaje || 'Error al guardar el producto';
      mostrarMensaje('danger', mensaje);
    }
  };

  const handleEliminar = (item: Producto) => {
    setToDelete(item);
    setShowConfirm(true);
  };

  const confirmarEliminar = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`/menu/${toDelete.id}`);
      setShowConfirm(false);
      mostrarMensaje('success', 'Producto eliminado correctamente');
      cargarMenu();
    } catch (error: any) {
      const mensaje = error?.response?.data?.mensaje || 'Error al eliminar el producto';
      mostrarMensaje('danger', mensaje);
    }
  };

  const mostrarMensaje = (tipo: 'success' | 'danger', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3000);
  };

  const ordenar = (col: string) => {
    const asc = col === ordenColumna ? !ordenAscendente : true;
    setOrdenColumna(col);
    setOrdenAscendente(asc);
    localStorage.setItem('ordenColumna', col);
    localStorage.setItem('ordenAscendente', asc.toString());
  };

  const sortedMenu = [...menu]
    .filter(item => {
      const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaSeleccionada === '' || item.idCategoria.toString() === categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    })
    .sort((a, b) => {
      const dir = ordenAscendente ? 1 : -1;
      switch (ordenColumna) {
        case 'nombre': return a.nombre.localeCompare(b.nombre) * dir;
        case 'precio': return (a.precio - b.precio) * dir;
        case 'disponible': return (Number(a.disponible) - Number(b.disponible)) * dir;
        case 'categoria': return a.categoria.localeCompare(b.categoria) * dir;
        default: return 0;
      }
    });

  return (
    <div className="container mt-3">
      <h1 className="mb-4">Menú</h1>

      {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              localStorage.setItem('busquedaMenu', e.target.value);
            }}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={categoriaSeleccionada}
            onChange={e => {
              setCategoriaSeleccionada(e.target.value);
              localStorage.setItem('catSeleccionada', e.target.value);
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4} className="text-end">
          {esAdmin && (
            <Button variant="success" onClick={() => abrirModal()}>
              ➕ Nuevo Producto
            </Button>
          )}
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => ordenar('nombre')} style={{ cursor: 'pointer' }}>Nombre</th>
            <th>Descripción</th>
            <th onClick={() => ordenar('precio')} style={{ cursor: 'pointer' }}>Precio</th>
            <th onClick={() => ordenar('disponible')} style={{ cursor: 'pointer' }}>Disponible</th>
            <th onClick={() => ordenar('categoria')} style={{ cursor: 'pointer' }}>Categoría</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {sortedMenu.map(item => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{item.descripcion}</td>
              <td>L. {item.precio.toFixed(2)}</td>
              <td className="text-center">{item.disponible ? '✅' : '❌'}</td>
              <td>{item.categoria}</td>
              {esAdmin && (
                <td>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => abrirModal(item)}>
                    ✏️ Editar
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleEliminar(item)}>
                    🗑️ Eliminar
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar "{toDelete?.nombre}"?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminar}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Editar producto' : 'Nuevo producto'}</Modal.Title>
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
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              value={formData.descripcion || ''}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              isInvalid={!!errores.descripcion}
            />
            <Form.Control.Feedback type="invalid">{errores.descripcion}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              value={formData.precio || ''}
              onChange={e => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
              isInvalid={!!errores.precio}
            />
            <Form.Control.Feedback type="invalid">{errores.precio}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              value={formData.idCategoria || ''}
              onChange={e => setFormData({ ...formData, idCategoria: parseInt(e.target.value) })}
              isInvalid={!!errores.idCategoria}
            >
              <option value="">Seleccione...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.idCategoria}</Form.Control.Feedback>
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Disponible"
            checked={formData.disponible || false}
            onChange={e => setFormData({ ...formData, disponible: e.target.checked })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={guardarProducto}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
