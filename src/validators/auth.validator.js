const { z } = require("zod");

const registerSchema = z.object({

    email: z
        .string()
        .strim()
        .toLowerCase()
        .email(),

    password: z
        .string()
        .min(8)

});

module.exports = {
    registerSchema
};