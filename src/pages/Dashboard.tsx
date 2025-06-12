// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaCashRegister, FaStar, FaUsers } from 'react-icons/fa';

interface DashboardData {
  ventasDelDia: number;
  productoMasVendido: string;
  empleadosActivos: number;
}

export default function Dashboard() {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar datos');
        return res.json();
      })
      .then(data => {
        setDatos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2>Dashboard General</h2>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>
                <FaCashRegister className="me-2 text-success" />
                Ventas del Día
              </Card.Title>
              <Card.Text className="fs-4">${datos!.ventasDelDia.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>
                <FaStar className="me-2 text-warning" />
                Producto Más Vendido
              </Card.Title>
              <Card.Text className="fs-4">{datos!.productoMasVendido}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>
                <FaUsers className="me-2 text-primary" />
                Empleados Activos
              </Card.Title>
              <Card.Text className="fs-4">{datos!.empleadosActivos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
