import { Router } from "express";
import { allowRoles } from "../../common/middlewares/auth.guard.js";

export const crearRouterConfiguracion = (configuracionController) => {
    const router = Router();

    router.get("/", configuracionController.obtenerConfiguracion);
    router.get("/sesion", configuracionController.obtenerSesion);
    router.patch("/sesion", allowRoles("admin"), configuracionController.actualizarDuracionSesion);

    return router;
};