// --- IMPORTAR LIBRERIA PARA ENCRIPTAR CLAVES ---
const argon2 = require("argon2");

// ----------------------------------
// HASHEAR CLAVE
// ----------------------------------

const hashPassword = async (password) => {
    return await argon2.hash(password);
};


// ----------------------------------
// COMPARAR CLAVE HASHEADA CON HASH 
// ----------------------------------

const verifyPassword = async (hash, password) => {
    return await argon2.verify(hash, password);
};

module.exports = {
    hashPassword,
    verifyPassword
};