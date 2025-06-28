// (No cambies este archivo, ya lo tienes bien)
import { useEffect, useState, useCallback } from 'react';
import axios from '../axiosConfig';
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
  fecha: string;       // Ahora vendrá como "YYYY-MM-DDTHH:mm:ss"
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

  const obtenerLogs = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/logs/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      setLogs([]);
    }
  }, []);

  useEffect(() => {
    obtenerLogs();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        obtenerLogs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [obtenerLogs]);

  const manejarOrden = (col: keyof Log) => {
    if (col === columnaOrden) {
      setOrden(orden === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(col);
      setOrden('asc');
    }
  };

  const logsFiltrados = logs.filter(log => {
    const fechaLog = new Date(log.fecha); 

    const textoBusqueda = busqueda.toLowerCase();

    // Aquí, al usar Date.UTC, se crean fechas UTC para comparar.
    // Si fechaLog es ahora una fecha LOCAL, la comparación podría no ser precisa
    // a través de medianoches si la diferencia de zona horaria es grande.
    // Sin embargo, para fechas completas (día entero), esto suele funcionar.
    // Si persistiera el problema con filtros de fecha, podríamos ajustar esto.
    const inicioComparacion = fechaInicio 
      ? new Date(Date.UTC(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate(), 0, 0, 0)) 
      : null;
    const finComparacion = fechaFin 
      ? new Date(Date.UTC(finFecha.getFullYear(), finFecha.getMonth(), finFecha.getDate(), 23, 59, 59, 999)) 
      : null;

    const desdeOK = !inicioComparacion || fechaLog >= inicioComparacion;
    const hastaOK = !finComparacion || fechaLog <= finComparacion;

    const coincideTexto =
      log.usuarioResponsable.toLowerCase().includes(textoBusqueda) ||
      log.accion.toLowerCase().includes(textoBusqueda) ||
      log.tablaAfectada.toLowerCase().includes(textoBusqueda) ||
      log.detalle.toLowerCase().includes(textoBusqueda); 

    return desdeOK && hastaOK && coincideTexto;
  });

  const logsOrdenados = logsFiltrados.sort((a, b) => {
    if (columnaOrden === 'fecha') {
      const diff = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      return orden === 'asc' ? diff : -diff;
    }
    const valA = a[columnaOrden] || '';
    const valB = b[columnaOrden] || '';
    return orden === 'asc'
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const totalPaginas = Math.ceil(logsOrdenados.length / elementosPorPagina);
  const inicio = (paginaActual - 1) * elementosPorPagina;
  const paginados = logsOrdenados.slice(inicio, inicio + elementosPorPagina);

  const exportarExcel = () => {
    const dataParaExcel = logsOrdenados.map(({ fecha, ...rest }) => ({
      ...rest,
      Fecha: new Date(fecha).toLocaleString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
    }));
    const ws = XLSX.utils.json_to_sheet(dataParaExcel);
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
        new Date(l.fecha).toLocaleString('es-HN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
      ]),
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 70 },
        4: { cellWidth: 35 },
      },
    });
    doc.save('Auditoria.pdf');
  };

  const resetFiltros = () => {
    setBusqueda('');
    setFechaInicio(null);
    setFechaFin(null);
    setPaginaActual(1);
    obtenerLogs();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Auditoría del Sistema</h2>

      <Row className="mb-3 align-items-center">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Buscar por usuario, acción, entidad o detalles..."
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
            isClearable
          />
        </Col>
        <Col md={2}>
          <DatePicker
            selected={fechaFin}
            onChange={setFechaFin}
            placeholderText="Hasta fecha"
            className="form-control"
            dateFormat="dd/MM/yyyy"
            isClearable
          />
        </Col>
        <Col md={1}>
          <Button variant="warning" size="sm" onClick={resetFiltros}>
            🔄 Reset
          </Button>
        </Col>
        <Col md={4} className="text-end">
          <Button variant="info" className="me-2" onClick={obtenerLogs}>
            🔁 Actualizar Logs
          </Button>
          <Button variant="success" className="me-2" onClick={exportarExcel}>
            📥 Excel
          </Button>
          <Button variant="danger" onClick={exportarPDF}>
            📄 PDF
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="auditoria-table">
        <thead>
          <tr>
            <th onClick={() => manejarOrden('usuarioResponsable')} style={{ cursor: 'pointer' }}>
              Usuario (login) {columnaOrden === 'usuarioResponsable' ? (orden === 'asc' ? '▲' : '▼') : ''}
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
                {new Date(log.fecha).toLocaleDateString('es-HN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}{' '}
                {new Date(log.fecha).toLocaleTimeString('es-HN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}
              </td>
            </tr>
          ))}
          {paginados.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted py-3">
                No hay registros de auditoría que coincidan con la búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
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