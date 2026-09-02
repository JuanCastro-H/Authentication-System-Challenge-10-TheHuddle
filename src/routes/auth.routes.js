const express = require("express");

const { register } = require("../controllers/auth.controller");

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

module.exports = router;
