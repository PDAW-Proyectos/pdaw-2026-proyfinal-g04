import { Router } from "express";
import { allowRoles } from "../../common/middlewares/auth.guard.js";

export const crearRouterConfiguracion = (configuracionController) => {
    const router = Router();

    router.get("/", configuracionController.obtenerConfiguracion);
    router.get("/stock", configuracionController.obtenerStock);
    router.get("/sesion", configuracionController.obtenerSesion);
    router.get("/negocio", configuracionController.obtenerNegocio);
    router.patch("/negocio", allowRoles(), configuracionController.actualizarNegocio);

    router.get("/cajas", configuracionController.obtenerCajas);
    router.post("/cajas", allowRoles("admin"), configuracionController.crearCaja);
    router.patch("/cajas/:nombre", allowRoles("admin"), configuracionController.actualizarCaja);
    router.patch("/expiracion", allowRoles(), configuracionController.actualizarExpiracion);
    router.patch("/stock", allowRoles(), configuracionController.actualizarStock);
    router.patch("/sesion", allowRoles(), configuracionController.actualizarDuracionSesion);

    return router;
};