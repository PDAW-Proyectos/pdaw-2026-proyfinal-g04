import { Router } from "express";

export default function crearRouterEgreso(
    egresoController
) {
    const router = Router();

    router.get("/", egresoController.listarEgresos);
    router.get("/:id", egresoController.buscarEgreso);
    router.post("/", egresoController.crearEgreso);
    router.put("/:id", egresoController.actualizarEgreso);
    router.delete("/:id", egresoController.eliminarEgreso);

    return router;
}
