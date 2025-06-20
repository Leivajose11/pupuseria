import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Form, Row, Col, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Log {
  usuarioResponsable: string;
  accion: string;
  tablaAfectada: string;
  detalle: string;
  fecha: string;
}

export default function Auditoria() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc');
  const [columnaOrden, setColumnaOrden] = useState<keyof Log>('fecha');
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  useEffect(() => {
    obtenerLogs();
  }, []);

  const obtenerLogs = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/logs/logs');
      setLogs(res.data);
    } catch {
      console.error('Error al obtener logs');
    }
  };

  const manejarOrden = (col: keyof Log) => {
    if (col === columnaOrden) {
      setOrden(orden === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(col);
      setOrden('asc');
    }
  };

  const logsFiltrados = logs.filter(log => {
    const texto = busqueda.toLowerCase();
    const fechaLog = new Date(log.fecha);
    const desdeOK = !fechaInicio || fechaLog >= fechaInicio;
    const hastaOK = !fechaFin || fechaLog < new Date(fechaFin.getTime() + 24 * 60 * 60 * 1000);
    const coincide =
      log.usuarioResponsable.toLowerCase().includes(texto) ||
      log.accion.toLowerCase().includes(texto) ||
      log.tablaAfectada.toLowerCase().includes(texto);
    return desdeOK && hastaOK && coincide;
  });

  const logsOrdenados = logsFiltrados.sort((a, b) => {
    if (columnaOrden === 'fecha') {
      const diff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      return orden === 'asc' ? diff : -diff;
    }
    return orden === 'asc'
      ? a[columnaOrden].localeCompare(b[columnaOrden])
      : b[columnaOrden].localeCompare(a[columnaOrden]);
  });

  const totalPaginas = Math.ceil(logsOrdenados.length / elementosPorPagina);
  const inicio = (paginaActual - 1) * elementosPorPagina;
  const paginados = logsOrdenados.slice(inicio, inicio + elementosPorPagina);

  const exportarExcel = () => {
    const data = logsOrdenados.map(({ fecha, ...rest }) => ({
      ...rest,
      fecha: new Date(fecha).toLocaleString('es-ES'),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Auditoria.xlsx');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Usuario', 'Acción', 'Entidad', 'Detalles', 'Fecha']],
      body: logsOrdenados.map(l => [
        l.usuarioResponsable,
        l.accion,
        l.tablaAfectada,
        l.detalle,
        new Date(l.fecha).toLocaleString('es-ES'),
      ]),
    });
    doc.save('Auditoria.pdf');
  };

  const resetFiltros = () => {
    setBusqueda('');
    setFechaInicio(null);
    setFechaFin(null);
    setPaginaActual(1);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Auditoría</h2>

      <Row className="mb-3 align-items-center">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Buscar por usuario, acción o entidad..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <DatePicker
            selected={fechaInicio}
            onChange={setFechaInicio}
            placeholderText="Desde fecha"
            className="form-control"
            dateFormat="dd/MM/yyyy"
          />
        </Col>
        <Col md={2}>
          <DatePicker
            selected={fechaFin}
            onChange={setFechaFin}
            placeholderText="Hasta fecha"
            className="form-control"
            dateFormat="dd/MM/yyyy"
          />
        </Col>
        <Col md={1}>
          <Button variant="warning" size="sm" onClick={resetFiltros}>
            🔄 Reset
          </Button>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="success" className="me-2" onClick={exportarExcel}>
            📥 Excel
          </Button>
          <Button variant="danger" onClick={exportarPDF}>
            📄 PDF
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => manejarOrden('usuarioResponsable')} style={{ cursor: 'pointer' }}>
              Usuario {columnaOrden === 'usuarioResponsable' ? (orden === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => manejarOrden('accion')} style={{ cursor: 'pointer' }}>
              Acción {columnaOrden === 'accion' ? (orden === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => manejarOrden('tablaAfectada')} style={{ cursor: 'pointer' }}>
              Entidad {columnaOrden === 'tablaAfectada' ? (orden === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Detalles</th>
            <th onClick={() => manejarOrden('fecha')} style={{ cursor: 'pointer' }}>
              Fecha {columnaOrden === 'fecha' ? (orden === 'asc' ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginados.map((log, idx) => (
            <tr key={idx}>
              <td>{log.usuarioResponsable}</td>
              <td>{log.accion}</td>
              <td>{log.tablaAfectada}</td>
              <td>{log.detalle}</td>
              <td>
                {new Date(log.fecha).toLocaleDateString('es-ES')}{' '}
                {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
            </tr>
          ))}
          {paginados.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No hay registros de auditoría.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="me-2"
            >
              ◀ Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ▶
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
