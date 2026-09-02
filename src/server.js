// ========================================
//  PUNTO DE ENTRADA DEL SERVIDOR
// ========================================
//  Arranca la aplicacion express
//  inicializa el puerto del servidor
//  y cargar el entorno.


// --- Cargar Variables De Entorno ---
require("dotenv").config();

// --- Imoprtar Configuracion De La Aplicacions ---
const app = require("./app");

// --- Definir Puerto ---
const PORT = process.env.PORT || 3000;

//  --- Iniciar Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});