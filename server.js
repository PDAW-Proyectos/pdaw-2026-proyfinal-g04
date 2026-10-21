import express from "express";
import path from "node:path";
import session from "express-session";
import { fileURLToPath } from "node:url";
import { Repository } from "./src/repository";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "clave-secreta-gestor",
    resave: false,
    saveUninitialized: false,
  }),
);

const RUTA_USUARIOS = path.join(__dirname, "data", "Usuarios.json");
const userRepository = new Repository(RUTA_USUARIOS)

// Rutas
app.use("/api/usuarios",crearRouterUsuarios(userRepository),);


const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un entero entre 1 y 65535.");
}

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en: http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
