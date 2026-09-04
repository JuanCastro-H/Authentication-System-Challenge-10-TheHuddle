// ====================================
// AUTORIZAR ACCIONES DEL USUARIO 
// ====================================

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // --- Comprobar Que El Usuario Este Logueado ---
        if (!req.user){

            return res.status(401).json({
                message: "Authentication required"
            });
        }
        
        // --- Autorizar Accion O No Segun El Rol ---
        if (!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message: "Access forbidden"
            });
        }

        // --- Continuar Flujo Del Programa ---
        next();
    };
};


module.exports = {
    authorizeRoles
};