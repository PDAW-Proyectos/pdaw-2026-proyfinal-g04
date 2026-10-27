
import { Router } from "express";
import { ProductoController } from "./producto.controller.js";

export default function crearRouterProductos(productoController) {
    const router = Router();

    router.get("/", productoController.listarProductos);
    router.get("/:id", productoController.buscarProducto);
    router.post("/", productoController.crearProducto);
    router.put("/:id", productoController.actualizarProducto);
    router.delete("/:id", productoController.eliminarProducto);

    return router;
}
