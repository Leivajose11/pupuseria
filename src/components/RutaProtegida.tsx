// src/components/RutaProtegida.tsx
import { Navigate } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  rolesPermitidos: string[];
}

export default function RutaProtegida({ children, rolesPermitidos }: Props) {
  const rol = sessionStorage.getItem('rol');
  const logueado = sessionStorage.getItem('logueado') === 'true';

  if (!logueado) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(rol || '')) {
    return <Navigate to="/" replace />;
  }

  return children;
}
