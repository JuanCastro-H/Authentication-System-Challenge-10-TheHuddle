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

// --- Ejecutar SEED --
main()
    .catch((error) => { // Manejo de errores.
        console.error(error); // Mostrar error.
        process.exit(1);      // Lanzar codigo 1.
    })
    .finally(async () => { // Cerrar conexion con prisma si o si al final.
        await prisma.$disconnect();
    });

