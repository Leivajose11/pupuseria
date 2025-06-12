// src/pages/Inicio.tsx
import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';

export default function Inicio() {
  const [data, setData] = useState({
    ventasHoy: 0,
    productoMasVendido: '',
    totalEmpleados: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard')
      .then((res) => res.json())
      .then((info) => {
        setData(info);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar dashboard:', error);
        setCargando(false);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Bienvenido a Pupusería Amparo</h2>
      {cargando ? (
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
        </div>
      ) : (
        <Row>
          <Col md={4}>
            <Card bg="warning" text="white" className="mb-4">
              <Card.Body>
                <Card.Title>Ventas del día</Card.Title>
                <Card.Text>${data.ventasHoy.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="danger" text="white" className="mb-4">
              <Card.Body>
                <Card.Title>Producto más vendido</Card.Title>
                <Card.Text>{data.productoMasVendido}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="info" text="white" className="mb-4">
              <Card.Body>
                <Card.Title>Total de empleados</Card.Title>
                <Card.Text>{data.totalEmpleados}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
