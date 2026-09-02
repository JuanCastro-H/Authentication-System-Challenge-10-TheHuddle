// ===========================
// SERVICIO DE AUTENTICACION
// ===========================

// --- Cliente De Comunicacion Con PostgresSQL
const { verify } = require("jsonwebtoken");
const prisma = require("../config/database");

// --- Funcion Para Hashear Una Clave ---
const { hashPassword, verifyPassword } = require("./password.service");
const { generateToken } = require("./jwt.service");


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


// ------------------------------
// INICIAR SESION
// ------------------------------

const loginUser = async ({email, password, ipAddress}) => {

    // --- Normalizar Email ---
    const normalizedEmail = email
        .trim()
        .toLowerCase();
    

    // --- Buscar Usuario ---
    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail
        },
        include: {
            role: true
        }
    });


    // --- Usuario No Existe ---
    if (!user) {

        throw new Error("INVALID_CREDENCIALS");

    }


    // --- Comprobar Si La Cuenta Esta Activa ---
    if (!user.isActive) {

        throw new Error("ACCOUNT_INACTIVE");

    }


    // --- Comprobar Si La Cuenta Esta Bloqueada ---
    if (user.lockedUntil && user.lockedUntil > new Date()){

        throw new Error("ACCOUNT_LOCKED");

    }


    // --- Verificar Contrasenia ---
    const passwordIsValid = await verifyPassword(
        user.passwordHash,
        password
    );


    // --- Contrasenia Incorrecta ---
    if (!passwordIsValid){

        throw new Error("INVALID_CREDENTIALS");

    }

    
    // --- Generar JWT ---

    const token = generateToken({

        sub: user.id,
        
        email: user.email,

        role: user.role.name

    });

    // --- Devolver Resultado ---

    return {
        token,

        user: {
            id: user.id,
            email: user.email,
            role: user.role
        }
    };


    
};

// --- Exportar Funciones Del Modulo ---
module.exports = {
    registerUser,
    loginUser
};