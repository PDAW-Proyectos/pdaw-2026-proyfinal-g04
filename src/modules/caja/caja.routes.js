import { Router } from "express";
import { allowRoles } from "../../common/middlewares/auth.guard.js";

export const crearRouterCaja = (cajaController) => {
    const router = Router();

    router.get("/", cajaController.listarCajas);
    router.get("/:id", cajaController.buscarCaja);
    router.query("/", cajaController.filtrarCajas);
    router.post("/", cajaController.crearCaja);
    router.post("/:id/venta", cajaController.registrarVenta);
    router.post("/:id/retiro", cajaController.retirarEfectivo);
    router.put("/:id", cajaController.actualizarCaja);
    router.put("/:id/cerrar", cajaController.cerrarCaja);
    router.delete("/:id", allowRoles("admin"), cajaController.eliminarCaja);

    return router;
};
