import { useEffect } from 'react';

export default function Empleados() {
  useEffect(() => {
    const logueado = localStorage.getItem('logueado');
    
    // Si no está logueado, redirigir a login
    if (!logueado) {
      window.location.href = '/login';
    }
  }, []);

  const rol = localStorage.getItem('rol');

  return (
    <div className="container mt-4">
      <h2>Página de Empleados</h2>

      {rol === 'Administrador' && <p>Contenido exclusivo para administradores</p>}
      {rol !== 'Administrador' && <p>No tienes permiso para ver esta sección.</p>}
    </div>
  );
}
