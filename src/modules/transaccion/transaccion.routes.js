import { Router } from "express";

export const crearRouterTransaccion = (transaccionesController) => {
    const router = Router();

    router.get("/", transaccionesController.listarTransacciones);
    router.query("/", transaccionesController.filtrarTransacciones);
    router.get("/:id", transaccionesController.buscarTransaccion);

    return router;
};