// ==================================
// CONFIGURACION DE LA APLICACION
// ==================================


// ----------------------------------
// IMPORTACIONES DE LIBRERIAS
// ----------------------------------
const express = require("express");            // Framework: Inicializa la aplicación y el servidor HTTP.
const helmet = require("helmet");              // Seguridad: Configura cabeceras HTTP para proteger la app.
const cors = require("cors");                  // Permisos: Controla qué dominios pueden hacer peticiones al servidor.
const cookieParser = require("cookie-parser"); // Datos: Analiza y estructura las cookies enviadas por el cliente.

// --- Crear Instancia De La Aplicacion ---
const app = express(); 


// ========================================
// MIDDLEWARES
// ========================================

// Permite recibir JSON
app.use(express.json());

// Permite recibir datos de formularios
app.use(express.urlencoded({ extended: true }));

// Permite trabajar con cookies
app.use(cookieParser());

// Cabeceras HTTP de seguridad
app.use(helmet());

// CORS
app.use(cors());


// ========================================
// RUTA DE PRUEBA
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "PassPort Authentication API",
        status: "running"
    });
});


module.exports = app;