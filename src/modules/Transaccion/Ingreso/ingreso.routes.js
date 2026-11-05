import { Router } from "express";

export default function crearRouterIngreso(
    IngresoController
) {
    const router = Router();

    router.get("/", IngresoController.listarIngresos);
    router.get("/:id", IngresoController.buscarIngreso);
    router.query("/", IngresoController.filtrarIngresos);
    router.post("/", IngresoController.crearIngreso);
    router.put("/:id", IngresoController.actualizarIngreso);
    router.delete("/:id", IngresoController.eliminarIngreso);

    return router;
}
