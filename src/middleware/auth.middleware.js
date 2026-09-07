// =============================================
// AUTENTICAR JWT DEL USUARIO
// =============================================

// --- Obtener Funcion Para verificar Tokens ---
const { verifyToken } = require("../services/jwt.service");

// --- Obtener Funcion De Hashin de tokens ---
const { hashToken } = require("../services/session.service");

const prisma = require("../config/database");

// -----------------------------------
// --- AUTENTICAR TOKEN + SESION ---
// -----------------------------------
const authenticateToken = async (req, res, next) => {

    // --- Obtener Authorization ---
    const authHeader = req.headers.authorization;

    // --- Comprobar Que Existe
    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    
    // --- Separar "Bearer" Del Token ---
    const [type, token] = authHeader.split(" ");


    // --- Comprobar Formato Bearer ---
    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    // --- Verificar JWT ---
    try {

        const decoded = verifyToken(token);

        // --- Comprobar Que Tiene Session ID ---
        if (!decoded.sessionId) {
            return res.status(401).json({
                message: "Session required"
            });
        }


        // --- Buscar Session En La BD ---
        const session = await prisma.session.findUnique({
            where: {
                id: decoded.sessionId
            }
        });


        // --- Comprobar Que Existe ---
        if (!session) {
            return res.status(401).json({
                message: "Session not found"
            });
        }


                // --- Comprobar Si Fue Revocada ---
        if (session.revokedAt) {
            return res.status(401).json({
                message: "Session revoked"
            });
        }


        // --- Comprobar Expiracion ---
        if (session.expiresAt <= new Date()){
            return res.status(401).json({
                message: "Session expired"
            });
        }


        // --- Comprobar Hash Del Token ---
        const tokenHash = hashToken(token);

        
        // --- Guardar Usuario Autenticado ---
        req.user = decoded;

        // --- Continuar Con La Peticion ---
        next();

    } catch (error) { // --- Si No Se Encuentra o hay error ---

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
};


module.exports = {
    authenticateToken
};

