import { Router } from "express";

export default function crearRouterIngreso(ingresoController) {
    const router = Router();

    router.get("/", ingresoController.listarIngresos);
    router.get("/:id", ingresoController.buscarIngreso);
    router.query("/", ingresoController.filtrarIngresos);
    router.post("/", ingresoController.crearIngreso);
    router.post("/venta", ingresoController.crearVenta);
    router.put("/:id", ingresoController.actualizarIngreso);
    router.delete("/:id", ingresoController.eliminarIngreso);

    return router;
}
