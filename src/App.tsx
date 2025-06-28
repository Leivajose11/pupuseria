import { Routes, Route } from 'react-router-dom';
import AppNavbar from "./components/layout/Navbar";
import Footer from './components/layout/Footer';

import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Caja from './pages/Caja';
import Empleados from './pages/Empleados';
import Reportes from './pages/Reportes';
import Proveedores from './pages/Proveedores';
import Bebidas from './pages/Bebidas';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';
import Logout from './pages/Logout';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Auditoria from './pages/Auditoria';

import RutaProtegida from './components/RutaProtegida';

export default function App() {
  return (
    <>
      <AppNavbar />
      <main className="container mt-5 pt-3 mb-5">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          <Route path="/" element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          } />

          <Route path="/inventario" element={
            <RutaProtegida>
              <Inventario />
            </RutaProtegida>
          } />

          <Route path="/caja" element={
            <RutaProtegida rolesPermitidos={['Administrador', 'Cajero']}>
              <Caja />
            </RutaProtegida>
          } />

          <Route path="/empleados" element={
            <RutaProtegida rolesPermitidos={['Administrador']}>
              <Empleados />
            </RutaProtegida>
          } />

          <Route path="/reportes" element={
            <RutaProtegida rolesPermitidos={['Administrador']}>
              <Reportes />
            </RutaProtegida>
          } />

          <Route path="/proveedores" element={
            <RutaProtegida rolesPermitidos={['Administrador', 'Cajero']}>
              <Proveedores />
            </RutaProtegida>
          } />

          <Route path="/bebidas" element={
            <RutaProtegida rolesPermitidos={['Administrador', 'Cajero', 'Mesero']}>
              <Bebidas />
            </RutaProtegida>
          } />

          <Route path="/menu" element={
            <RutaProtegida>
              <Menu />
            </RutaProtegida>
          } />

          <Route path="/perfil" element={
            <RutaProtegida>
              <Perfil />
            </RutaProtegida>
          } />

          <Route path="/configuracion" element={
            <RutaProtegida rolesPermitidos={['Administrador']}>
              <Configuracion />
            </RutaProtegida>
          } />

          <Route path="/register" element={
            <RutaProtegida rolesPermitidos={['Administrador']}>
              <Register />
            </RutaProtegida>
          } />

          <Route path="/auditoria" element={
            <RutaProtegida rolesPermitidos={['Administrador']}>
              <Auditoria />
            </RutaProtegida>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
