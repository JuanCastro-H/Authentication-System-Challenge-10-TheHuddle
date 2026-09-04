// ====================================
// SERVICIO DE ENCRIPTACION DE TOKENS
// ====================================

// --- Importar Libreria Cryptografica ---
const crypto = require("crypto");

// --- Convierte Token En Texto Plano En Un Hash ---
const hashToken = (token) => {

    return crypto
        .createHash("sha256") // Inicializa el algoritmo criptografico SHA-256.
        .update(token)        // Introduce el texto del token dentro del algoritmo.
        .digest("hex");       // Genera el resultado final en una cadena Hexadecimal.
};

module.exports = {
    hashToken
};