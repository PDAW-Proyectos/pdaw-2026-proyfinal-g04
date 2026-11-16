import { Router } from "express";
import { allowRoles } from "../../common/middlewares/auth.guard.js";

export function crearRouterProveedores(proveedorController) {
    const router = Router();

    router.get("/", proveedorController.listarProveedores);
    router.get("/:id", proveedorController.buscarProveedor);
    router.post("/", allowRoles("admin"), proveedorController.crearProveedor);
    router.put("/:id", allowRoles("admin"), proveedorController.actualizarProveedor);
    router.delete("/:id", allowRoles("admin"), proveedorController.eliminarProveedor);

    return router;
}
