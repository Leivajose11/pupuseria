import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  rolesPermitidos?: string[]; // Ej: ['Administrador', 'Cajero']
}

export default function RutaProtegida({ children, rolesPermitidos }: Props) {
  const logueado = sessionStorage.getItem('logueado') === 'true';
  const rol = sessionStorage.getItem('rol');

  if (!logueado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol || '')) {
    return <Navigate to="/" replace />;
  }

  return children;
}
