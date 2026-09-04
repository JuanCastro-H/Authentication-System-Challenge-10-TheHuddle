// =============================================
// VERIFICAR SI EL USUARIO TIENE UN JWT VALIDO
// =============================================

// --- Obtener Funcion Para verificar Tokens ---
const { verifyToken } = require("../services/jwt.service");

// -------------------------------
// --- AUTENTICAR TOKEN ---
// -------------------------------
const authenticateToken = (req, res, next) => {

    // --- Obtener Authorization ---
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    
    // --- Comprobar Formato Bearer ---
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    // --- Verificar JWT ---
    try {

        const decoded = verifyToken(token);

        // --- Guardar Usuario Autenticado ---
        req.user = decoded;

        // --- Continuar Con La Peticion ---
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};


module.exports = {
    authenticateToken
};

