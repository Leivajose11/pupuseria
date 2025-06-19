import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Empleados() {
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');

  useEffect(() => {
    const logueado = localStorage.getItem('logueado');
    if (logueado !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="container mt-4">
      <h2>Página de Empleados</h2>

      {rol === 'Administrador' ? (
        <p>Contenido exclusivo para administradores</p>
      ) : (
        <p className="text-danger">No tienes permiso para ver esta sección.</p>
      )}
    </div>
  );
}
