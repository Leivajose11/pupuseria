// C:\Users\Leiva\pupuseria\backend\routes\auth.js

const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require('../dbConfig');
const registrarLog = require('../utils/logger'); // ¡Asegúrate de que esta línea esté presente!
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
require('dotenv').config();

// LOGIN
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .query(`
                SELECT u.id, u.nombre, u.usuario, u.password, r.nombre AS rol
                FROM Usuarios u
                JOIN Roles r ON u.idRol = r.id
                WHERE u.usuario = @usuario AND u.activo = 1
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado o inactivo' });
        }

        const usuarioData = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, usuarioData.password);

        if (!passwordMatch) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        // Generar token con `usuario` incluido (id, nombre, usuario, rol)
        const token = jwt.sign(
            {
                id: usuarioData.id,
                nombre: usuarioData.nombre,
                usuario: usuarioData.usuario, // Asegúrate de que este es el campo de login
                rol: usuarioData.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            id: usuarioData.id,
            nombre: usuarioData.nombre,
            usuario: usuarioData.usuario,
            rol: usuarioData.rol
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});


// ==========================
// RUTAS PROTEGIDAS DESDE AQUÍ
// ==========================

// PERFIL (datos del usuario logeado)
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        // req.usuario contiene el objeto de usuario decodificado del token
        const usuarioId = req.usuario.id; 
        const pool = await sql.connect(config);

        const result = await pool.request()
            .input('id', sql.Int, usuarioId)
            .query(`
                SELECT u.id, u.nombre, u.usuario, r.nombre AS rol, u.activo, u.fechaRegistro
                FROM Usuarios u
                JOIN Roles r ON u.idRol = r.id
                WHERE u.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ mensaje: 'Error al obtener perfil del usuario' });
    }
});

// ACTUALIZAR PERFIL (nombre y/o contraseña)
router.put('/perfil', verificarToken, async (req, res) => {
    const { nombre, actualPassword, nuevaPassword } = req.body;
    const usuarioId = req.usuario.id; // Obtenemos el ID del token

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, usuarioId)
            .query('SELECT password FROM Usuarios WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const user = result.recordset[0];

        let updateFields = [];
        let updateInputs = [];

        if (nuevaPassword) {
            const esValida = await bcrypt.compare(actualPassword, user.password);
            if (!esValida) {
                return res.status(400).json({ mensaje: 'Contraseña actual incorrecta' });
            }
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
            updateFields.push('password = @password');
            updateInputs.push({ name: 'password', type: sql.VarChar, value: hashedPassword });
        }

        if (nombre) {
            updateFields.push('nombre = @nombre');
            updateInputs.push({ name: 'nombre', type: sql.VarChar, value: nombre });
        }

        if (updateFields.length > 0) {
            const request = pool.request();
            updateInputs.forEach(input => request.input(input.name, input.type, input.value));
            request.input('id', sql.Int, usuarioId);

            await request.query(`
                UPDATE Usuarios
                SET ${updateFields.join(', ')}
                WHERE id = @id
            `);

            // Log de auditoría para actualizar perfil
            await registrarLog(req.usuario, 'EDITAR_PERFIL', 'Usuarios', usuarioId, `Perfil actualizado por ${req.usuario.usuario}`);
        } else {
             return res.status(200).json({ mensaje: 'No hay cambios para actualizar en el perfil.' });
        }

        res.json({ mensaje: 'Perfil actualizado correctamente' });

    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ mensaje: 'Error al actualizar perfil del usuario' });
    }
});


// REGISTRAR NUEVO USUARIO (solo administrador)
router.post('/register', verificarToken, verificarRol('administrador'), async (req, res) => {
    // ELIMINAMOS 'usuarioResponsableId' de req.body porque ya lo obtenemos de req.usuario (el token)
    const { nombre, usuario, password, idRol } = req.body; 

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await sql.connect(config);

        const result = await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('usuario', sql.VarChar, usuario)
            .input('password', sql.VarChar, hashedPassword)
            .input('idRol', sql.Int, idRol)
            .query(`
                INSERT INTO Usuarios (nombre, usuario, password, idRol, activo, fechaRegistro)
                OUTPUT INSERTED.id
                VALUES (@nombre, @usuario, @password, @idRol, 1, GETDATE())
            `);

        const nuevoId = result.recordset[0].id;

        // *** CAMBIO CRUCIAL: PASAMOS 'req.usuario' COMPLETO ***
        await registrarLog(req.usuario, 'CREAR_USUARIO', 'Usuarios', nuevoId, `Usuario '${nombre}' creado con rol ID ${idRol}`);

        res.status(201).json({ mensaje: 'Usuario registrado con éxito' });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
});

// OBTENER TODOS LOS USUARIOS
router.get('/usuarios', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT u.id, u.nombre, u.usuario, r.id AS idRol, r.nombre AS rol, u.activo, u.fechaRegistro
            FROM Usuarios u
            JOIN Roles r ON u.idRol = r.id
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ mensaje: 'Error al cargar usuarios' });
    }
});

// ACTUALIZAR USUARIO
router.put('/usuarios/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    // ELIMINAMOS 'usuarioResponsableId' de req.body
    const { nombre, usuario, password, idRol, activo } = req.body; 
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        const request = pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('usuario', sql.VarChar, usuario)
            .input('idRol', sql.Int, idRol)
            .input('activo', sql.Bit, activo)
            .input('id', sql.Int, id);

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            request.input('password', sql.VarChar, hashedPassword);
            await request.query(`
                UPDATE Usuarios
                SET nombre = @nombre, usuario = @usuario, password = @password, idRol = @idRol, activo = @activo
                WHERE id = @id
            `);
        } else {
            await request.query(`
                UPDATE Usuarios
                SET nombre = @nombre, usuario = @usuario, idRol = @idRol, activo = @activo
                WHERE id = @id
            `);
        }

        // *** CAMBIO CRUCIAL: PASAMOS 'req.usuario' COMPLETO ***
        await registrarLog(req.usuario, 'EDITAR_USUARIO', 'Usuarios', parseInt(id), `Usuario editado: ${nombre}`);

        res.json({ mensaje: 'Usuario actualizado' });

    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
});

// ELIMINAR USUARIO
router.delete('/usuarios/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    // ELIMINAMOS 'usuarioResponsableId' de req.body
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Usuarios WHERE id = @id');

        // *** CAMBIO CRUCIAL: PASAMOS 'req.usuario' COMPLETO ***
        await registrarLog(req.usuario, 'ELIMINAR_USUARIO', 'Usuarios', parseInt(id), `Usuario ID ${id} eliminado permanentemente`);

        res.json({ mensaje: 'Usuario eliminado permanentemente' });

    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
});

// DESACTIVAR USUARIO
router.patch('/usuarios/:id/desactivar', verificarToken, verificarRol('administrador'), async (req, res) => {
    // ELIMINAMOS 'usuarioResponsableId' de req.body
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Usuarios SET activo = 0 WHERE id = @id');

        // *** CAMBIO CRUCIAL: PASAMOS 'req.usuario' COMPLETO ***
        await registrarLog(req.usuario, 'DESACTIVAR_USUARIO', 'Usuarios', parseInt(id), `Usuario desactivado`);

        res.json({ mensaje: 'Usuario desactivado' });

    } catch (err) {
        console.error('Error al desactivar usuario:', err);
        res.status(500).json({ mensaje: 'Error al desactivar usuario' });
    }
});

// REACTIVAR USUARIO
router.patch('/usuarios/:id/activar', verificarToken, verificarRol('administrador'), async (req, res) => {
    // ELIMINAMOS 'usuarioResponsableId' de req.body
    const { id } = req.params;

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE Usuarios SET activo = 1 WHERE id = @id');

        // *** CAMBIO CRUCIAL: PASAMOS 'req.usuario' COMPLETO ***
        await registrarLog(req.usuario, 'REACTIVAR_USUARIO', 'Usuarios', parseInt(id), `Usuario reactivado`);

        res.json({ mensaje: 'Usuario activado' });

    } catch (err) {
        console.error('Error al activar usuario:', err);
        res.status(500).json({ mensaje: 'Error al activar usuario' });
    }
});

// OBTENER ROLES
router.get('/roles', verificarToken, async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT id, nombre FROM Roles');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener roles:', err);
        res.status(500).json({ mensaje: 'Error al cargar roles' });
    }
});

module.exports = router;