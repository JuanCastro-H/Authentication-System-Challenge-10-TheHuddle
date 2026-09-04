// ===========================
// SERVICIO DE AUTENTICACION
// ===========================

// --- Cliente De Comunicacion Con PostgresSQL
const prisma = require("../config/database");

// --- Funcion Para Hashear Una Clave ---
const { hashPassword, verifyPassword } = require("./password.service");
const { generateToken } = require("./jwt.service");


const { hashToken, generateSessionPlaceholder } = require("./session.service");


// ----------------------------------------
// CONFIGURACIÓN DE SEGURIDAD
// ----------------------------------------

// --- Intentos Antes De Bloquear La Cuenta ---
const MAX_FAILED_ATTEMPTS = 5;

// --- Tiempo De Bloqueo ---
const LOCK_TIME_MINUTES = 15;

const SESSION_DURATION_MINUTES = 15;



// ------------------------------
// REGISTRAR INTENTOS DE LOGIN
// ------------------------------

const createLoginAttempt = async ({
    userId,
    email,
    ipAddress,
    success
}) => {

    await prisma.loginAttempt.create({
        data: {
            userId,
            email,
            ipAddress,
            success
        }
    });
};


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
            role: true // Traer el rol relacionado al usuario.
        }
    });


    // --- Si El Usuario No Existe ---
    if (!user) {

        //  Registrar intento de registro fallido.
        await createLoginAttempt({

            userId: null,
            email: normalizedEmail,
            ipAddress,
            success: false

        });

        throw new Error("INVALID_CREDENCIALS");

    }


    // --- Comprobar Si La Cuenta Esta Activa ---
    if (!user.isActive) {

        await createLoginAttempt({
            userId: user.id,
            email: user.email,
            ipAddress,
            success: false
        });

        throw new Error("ACCOUNT_INACTIVE");

    }


    // --- Comprobar Si La Cuenta Esta Bloqueada ---
    if (user.lockedUntil && user.lockedUntil > new Date()){

        throw new Error("ACCOUNT_LOCKED");

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

        // Registrar intentos
        await createLoginAttempt({

            userId: user.id,
            email: user.email,
            ipAddress,
            success: false

        });

        // Aumentar El Numero De Intentos Fallidos
        const failedAttempts = user.failedLoginAttempts + 1;

        // Llego Al Limite?
        if (failedAttempts >= MAX_FAILED_ATTEMPTS){

            // Calcular Tiempo Del Bloqueo.
            const lockedUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    failedLoginAttempts: failedAttempts,
                    lockedUntil
                }
            });
        
        } else {

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    failedLoginAttempts: failedAttempts
                }
            });

        }

        throw new Error("INVALID_CREDENTIALS");

    }


    // --- Login Correcto ---

    await createLoginAttempt({

        userId: user.id,
        email: user.email,
        ipAddress,
        success: true

    });


    // --- Reiniciar Contador ---

    await prisma.user.update({

        where: {
            id: user.id
        },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null
        }

    });

    // --- Calcular Fecha De Expiracion De La Session ---
    const expired = new Date(
        Date.now() + SESSION_DURATION_MINUTES * 60 * 1000
    );


    // --- Registrar Session En La Base De Datos ---
    const session = await prisma.session.create({
        data: {
            sessionTokenHash: generateSessionPlaceholder(),
            userId: user.id,
            expiresAt
        }
    });


    // --- Generar JWT ---

    const token = generateToken({

        sub: user.id,
        
        email: user.email,

        role: user.role.name,

        sessionId: session.id

    });


    // --- Encriptar Token De Session Antes De Guardarlo ---
    const sessionTokenHash = hashToken(token);


    await prisma.session.update({
        where: {
            id: session.id
        },
        data: {
            sessionTokenHash
        }
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