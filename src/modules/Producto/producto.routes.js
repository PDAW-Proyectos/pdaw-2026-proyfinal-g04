
import { Router } from "express";

export default function crearRouterProductos(productoController) {
    const router = Router();

    router.get("/", productoController.listarProductos);
    router.get("/:id", productoController.buscarProducto);
    router.query("/", productoController.filtrarProductos);
    router.post("/", productoController.crearProducto);
    router.put("/:id", productoController.actualizarProducto);
    router.delete("/:id", productoController.eliminarProducto);

    return router;
}
