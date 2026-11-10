import { Router } from "express";

export const crearRouterCaja = (cajaController) => {
    const router = Router();

    router.get("/", cajaController.listarCajas);
    router.get("/:id", cajaController.buscarCaja);
    router.query("/", cajaController.filtrarCajas);
    router.post("/", cajaController.crearCaja);
    router.put("/:id", cajaController.actualizarCaja);
    router.put("/:id/cerrar", cajaController.cerrarCaja);
    router.delete("/:id", cajaController.eliminarCaja);

    return router;
};
