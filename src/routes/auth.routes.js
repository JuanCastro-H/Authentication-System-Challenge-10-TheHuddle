const express = require("express");

const { register, login, getCurrentUser } = require("../controllers/auth.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();


// ---------------------------
// REGISTRO
// Ruta tipo POST/register
// ---------------------------
router.post("/register", register);


// ---------------------------
// LOGIN
// Ruta tipo POST/login
// ---------------------------

router.post("/login", login);


// --- Ruta De Prueba Protegida ---
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;
