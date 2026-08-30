const { PrismaClient } = require("../../prisma/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");


// ---------------------------------------------
// ADAPTADOR DE POSTGRESQL
// Prepara los datos de acceso a la BD externa
// ---------------------------------------------

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});


// ----------------------------------------------------
// CLIENTE PRISMA
// Crea el gestor para guardar, ver o borrar datos
// ----------------------------------------------------

const prisma = new PrismaClient({
    adapter
});


module.exports = prisma;