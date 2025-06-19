import { Routes, Route } from 'react-router-dom';
//import AppNavbar from './components/layout/Navbar';
import AppNavbar from "./components/layout/Navbar";

import Footer from './components/layout/Footer';

// Páginas
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
import Login from './pages/Login'; // ← ¡Nueva importación!
import Register from './pages/Register'; // ← ¡Nueva importación!


export default function App() {
  return (
    <>
      <AppNavbar />
      <main className="container mt-5 pt-3 mb-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/bebidas" element={<Bebidas />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} /> {/* ← Ruta agregada */}
          <Route path="/register" element={<Register />} />

        </Routes>
      </main>
      <Footer />
    </>
  );
}
