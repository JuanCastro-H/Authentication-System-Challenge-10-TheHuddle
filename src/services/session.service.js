// ====================================
// SERVICIO DE ENCRIPTACION DE TOKENS
// ====================================

// --- Importar Libreria Cryptografica ---
const crypto = require("crypto");

// --- Hashea El JWT ---
const hashToken = (token) => {

    return crypto
        .createHash("sha256") // Inicializa el algoritmo criptografico SHA-256.
        .update(token)        // Introduce el texto del token dentro del algoritmo.
        .digest("hex");       // Genera el resultado final en una cadena Hexadecimal.
};


// --- Generar Identificador Temporal Para La Session  ---
const generateSessionPlaceholder = () => {
    return crypto.randomBytes(32).toString("hex"); // Genera un valor temporal para iniciar la sesion.
                                                   // Despues lo reemplazamos por el hash real del JWT.
}


// --- Exportar Funciones Del Modulo ---
module.exports = {
    hashToken,
    generateSessionPlaceholder
};