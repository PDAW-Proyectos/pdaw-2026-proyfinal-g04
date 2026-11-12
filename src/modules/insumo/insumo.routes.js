
import { Router } from "express";

export default function crearRouterProductos(insumoController) {
    const router = Router();

    router.get("/", insumoController.listarInsumos);
    router.get("/:id", insumoController.buscarInsumo);
    router.query("/", insumoController.filtrarInsumos);
    router.post("/", insumoController.crearInsumo);
    router.put("/:id", insumoController.actualizarInsumo);
    router.delete("/:id", insumoController.eliminarInsumo);

    return router;
}
