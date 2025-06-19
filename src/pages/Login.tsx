import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async () => {
    try {
      const respuesta = await axios.post('http://localhost:4000/api/auth/login', {
        usuario,
        password,
      });

      const data = respuesta.data;

      if (data?.rol && data?.nombre && data?.id) {
  sessionStorage.setItem('logueado', 'true');
  sessionStorage.setItem('rol', data.rol);
  sessionStorage.setItem('nombre', data.nombre);
  sessionStorage.setItem('usuarioId', data.id.toString());
  navigate('/');
}
 else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Iniciar sesión</h2>
      <input
        type="text"
        placeholder="Usuario"
        className="form-control mb-2"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="form-control mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-primary mb-3" onClick={manejarLogin}>
        Ingresar
      </button>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}
