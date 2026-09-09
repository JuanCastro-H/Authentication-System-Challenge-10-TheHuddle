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


    // ---------------------------------
    // OPCION 1 - JWT BEARER
    // ---------------------------------

    /* --- Comprobar Que Existe
    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required"
        });
    } */

    if (authHeader) {

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
    

            // --- Traer Y Comprobar Hash Del Token ---
            const tokenHash = hashToken(token);
    
            if (tokenHash !== session.sessionTokenHash){
                return res.status(401).json({
                    message: "Invalid session token"
                });
            }
            
    
            // --- Guardar Usuario Autenticado ---
            req.user = decoded;
    
            // --- Continuar Con La Peticion ---
            next();
    
        } catch (error) { // --- Si No Se Encuentra o hay error ---
    
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }
    }

    // -----------------------------
    // OPCION 2 - COOKIE
    // -----------------------------

    // --- Obtener La Session De La Cookie ---
    const sessionId = req.cookies.sessionId;

    // --- Manejar Error Si No Se Obtiene ---
    if (!sessionId) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {

        // --- Buscar Sesion ---

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            include: {
                user: {
                    include: {
                        role: true
                    }
                }
            }
        });


        // --- Comprobar Que Se Obtuvo ---
        if (!session) {
            return res.status(401).json({
                message: "Session not found"
            });
        }


        // --- Comprobar Revocacion ---
        if (session.revokedAt) {
            return res.status(401).json({
                message: "Session revoked"
            });
        }


        // --- Comprobar Expiracion ---
        if (session.expiresAt <= new Date()) {
            return res.status(401).json({
                message: "Session expired"
            })
        }


        // --- Comprobar Actividad De La Cuenta ---

        if (!session.user.isActive) {
            return res.status(403).json({
                message: "Account inactive"
            });
        }


        // --- Crear req.user ---

        req.user = {
            sub: session.user.id,
            email: session.user.email,
            role: session.user.role.name,
            sessionId: session.id
        };


        // --- Continuar Con El Flujo ---

        next();

    } catch (error) {

        // --- Imprimir errores ---
        console.error(error);

        // --- Devolver Error Desconocido Del Servidor ---
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


module.exports = {
    authenticateToken
};

