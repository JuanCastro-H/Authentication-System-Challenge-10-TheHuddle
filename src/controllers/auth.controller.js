const { registerSchema } = require("../validators/auth.validator");

const { registerUser }   = require("../services/auth.service");

const register = async (req, res) => {

    try {
        // --- Validar Datos ---
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: "Invalid data",
                details: validation.error.flatten()
            });
        }

        // --- Crear Usuario ---
        const user = await registerUser(validation.data);

        // --- Respuesta ---
        return res.status(201).json({
            message: "User registered successfully",
            user
        });
    
    } catch (error) {

        // --- Usuario Ya Existente ---
        if (error.message === "USER_ALREADY_EXISTS") {
            return res.status(409).json({
                error: "User already exists"
            });
        }

        // --- Error De Configuracion ---
        if (error.message === "DEFAULT_ROLE_NOT_FOUND"){
            return res.status(500).json({
                error: "Default role is not configured"
            });
        }

        // --- Error Desconocido ---
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });

    }
};


module.exports = {
    register
};