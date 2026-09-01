// ===========================
// SERVICIO DE AUTENTICACION
// ===========================

const prisma = require("../config/database");

const { hashPassword } = require("./password.service")


// ------------------------------
// REGISTRAR USUARIO
// ------------------------------

const registerUser = async ({email, password}) => {

    // --- Normalizar Email ---
    const normalizedEmail = email.trim().toLowerCase();


    // ---- Comprobar Si Existe El Usuario ---
    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail
        }
    });

    if (existingUser) { // Si existe el usuario...
        throw new Error("USER_ALREADY_EXISTS");
    }


    // --- Asignar Rol Por Defecto ---
    const userRole = await prisma.role.findUnique({
        where: {
            name: "user"
        }
    });

    if (!userRole){ // Sino existe un rol...
        throw new Error("DEFAULT_ROLE_NOT_FOUND");
    }


    // --- Hashear Contrasenia ---
    const passwordHash = await hashPassword(password);


    // --- Crear Usuario ---
    const user = await prisma.user.create({
        data: {
            email: normalizedEmail,
            passwordHash,
            roleId: userRole.id
        }
    });

    // --- Retornar Datos Del Usuario ---
    return {
        id: user.id,
        email: user.email,
        role: userRole,
        createdAt: user.createdAt
    };
};

// --- Exportar Funciones Del Modulo ---
modulo.exports = {
    registerUser
};