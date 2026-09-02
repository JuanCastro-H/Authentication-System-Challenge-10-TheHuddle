const { z } = require("zod"); // Libreria de validacion de datos.

// --- Validacion Para El Registro De Usuarios ---
const registerSchema = z.object({

    // --- Validacion De Email ---
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),

    // --- Esquema De Contrasenia ---
    password: z
        .string({required_error: "Falta Agregar la contraseña." })
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })

});


// --- Exportar Esquema De Registro ---
module.exports = {
    registerSchema
};