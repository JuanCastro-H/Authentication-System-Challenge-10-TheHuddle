// ========================================
// SERVICIO DE GESTION DE JWT
// ========================================

// --- Importar Libreria de JWT ---
const jwt = require("jsonwebtoken");


// ----------------------------------------
// GENERAR JWT
// ----------------------------------------

const generateToken = (payload) => {

    // --- Generar Un Token Firmado Para El Usuario ---
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};


// ----------------------------------------
// VERIFICAR JWT
// ----------------------------------------

const verifyToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );
};


// --- Exportar Importaciones ---

module.exports = {
    generateToken,
    verifyToken
};

