import { Router } from "express";

export const crearRouterConfiguracion = (configuracionController) => {
    const router = Router();

    router.get("/", configuracionController.obtenerConfiguracion);
    router.get("/sesion", configuracionController.obtenerSesion);
    router.patch("/sesion", configuracionController.actualizarDuracionSesion);

    return router;
};