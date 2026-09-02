// ===========================
// SERVICIO DE AUTENTICACION
// ===========================

// --- Cliente De Comunicacion Con PostgresSQL
const prisma = require("../config/database");

// --- Funcion Para Hashear Una Clave ---
const { hashPassword } = require("./password.service")


// ------------------------------
// REGISTRAR USUARIO
// ------------------------------

const registerUser = async ({email, password}) => {

    // --- Normalizar Email ---
    const normalizedEmail = email.trim().toLowerCase(); // Eliminar espacios y convertir a minusculas.


    // ---- Comprobar Si Existe El Usuario ---
    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail
        }
    });

    if (existingUser) { // Si existe el usuario detenemos el registro.
        throw new Error("USER_ALREADY_EXISTS");
    }


    // --- Asignar Rol "Usuario" Por Defecto ---
    const userRole = await prisma.role.findUnique({
        where: {
            name: "user"
        }
    });

    if (!userRole){ // Sino existe "User... 
        throw new Error("DEFAULT_ROLE_NOT_FOUND"); // Notificar de error en la configuracion.
    }


    // --- Hashear Contrasenia ---
    const passwordHash = await hashPassword(password);


    // --- Crear Usuario ---
    const user = await prisma.user.create({
        data: {
            email: normalizedEmail,  // Correo.
            passwordHash,            // Clave hasheada.
            roleId: userRole.id      // Id del nuevo usuario.
        }
    });

    // --- Retornar Datos Publicos Del Usuario ---
    return {
        id: user.id,
        email: user.email,
        role: userRole,
        createdAt: user.createdAt
    };
};

// --- Exportar Funciones Del Modulo ---
module.exports = {
    registerUser
};