import { Router } from "express";
import { requireAuth, allowRoles } from "../../common/middlewares/auth.guard.js";

export default function crearRouterProductos(productoController) {
    const router = Router();

    router.get("/", productoController.listarProductos);
    router.get("/:id", productoController.buscarProducto);
    router.query("/", productoController.filtrarProductos);
    router.post("/", requireAuth, allowRoles("admin"), productoController.crearProducto);
    router.put("/actualizar-precios", requireAuth, allowRoles(), productoController.actualizarPreciosMasivo);
    router.put("/:id", requireAuth, allowRoles("repositor"), productoController.actualizarProducto);
    router.delete("/:id", requireAuth, allowRoles("repositor"), productoController.eliminarProducto);

    return router;
}
