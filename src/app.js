// src/app.js (o server.js)
const express = require("express");
const app = express();

// OBLIGATORIO: para poder leer req.body en formato JSON
app.use(express.json());

// Servir la carpeta estática (donde está login.html, login.js, etc.)
app.use(express.static("public"));

// Lista básica de usuarios para probar
const usuarios = [
  { email: "cajero@kchin.com", password: "123", role: "cajero" },
  { email: "admin@kchin.com", password: "123", role: "admin" },
  { email: "repositor@kchin.com", password: "123", role: "repositor" },
];

// Endpoint básico de autenticación
app.post("/api/login", (req, res) => {
  const correo = req.body.correo || req.body.email;
  const contrasena = req.body.contrasena || req.body.password;

  const user = usuarios.find(
    (u) => u.email === correo && u.password === contrasena,
  );

  if (!user) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  return res.json({ ok: true, role: user.role });
});
