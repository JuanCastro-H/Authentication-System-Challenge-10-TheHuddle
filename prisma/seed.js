// =============================
// SEED DE DATOS INICIALES 
// =============================

// -----------------------------
// IMPORTACIONES 
// -----------------------------

// --- Cliente De Prisma ---
const { PrismaClient } = require("./generated/prisma/client");

// --- Adaptador Para Comunicacion Con PostgreSQL ---
const { PrismaPg } = require("@prisma/adapter-pg");

// --- Cargar Variables De Entorno ---
require("dotenv").config();

const argon2 = require("argon2");


// ---------------------------
// CONEXION CON POSTGRESQL
// ---------------------------

// --- Crear Adaptador/Conexion Con La URL ---
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

// --- Crear Cliente Prisma ---
const prisma = new PrismaClient({
    adapter 
});


// -----------------------
// SEED
// -----------------------
const main = async () => {

    // --- Asegurar La Crearcion Del Rol "Usuario" ---
    await prisma.role.upsert({
        where: {
            name: "user"
        },
        update: {},
        create: {
            name: "user"
        }
    });

    // --- Asegurar La Creacion Del Rol "Admin" ---
    await prisma.role.upsert({
        where: {
            name: "admin"
        },
        update: {},
        create: {
            name: "admin"
        }
    });

    console.log("Roles creados correctamente.");

};


// ----------------------------------
// CREAR USUARIO DE PRUEBA ADMIN
// ----------------------------------

// --- Busca El Rol Admin En BD ---
const adminRole = await prisma.role.findUnique({
    where: {
        name: "admin"
    }
});


// --- Encriptar Clave ---
const adminPasswordHash = await argon2.hash("AdminPassword123.");


// --- Creaar O Confirmar El Usuario ---

await prisma.user.upsert({
    where: {   // Buscar el correo de admin de prueba.
        email: "admin@example.com"
    },
    update: {},// Si Exite No Hacer nadaa.
    create: {  // Sino Crear Desde 0.
        email: "admin@example.com",
        passwordHash: adminPasswordHash,
        roleId: adminRole.id
    }
});



// --- Ejecutar SEED --
main()
    .catch((error) => { // Manejo de errores.
        console.error(error); // Mostrar error.
        process.exit(1);      // Lanzar codigo 1.
    })
    .finally(async () => { // Cerrar conexion con prisma si o si al final.
        await prisma.$disconnect();
    });

