
import { Router } from "express";

export default function crearRouterUsuarios(
    userController
) {
    const router = Router();

    router.get("/", userController.listarUsuarios);
    router.get("/:id", userController.buscarUsuario);
    router.query("/", userController.filtrarUsuarios);
    router.post("/", userController.crearUsuario);
    router.put("/:id", userController.actualizarUsuario);
    router.delete("/:id", userController.eliminarUsuario);

    return router;
}
