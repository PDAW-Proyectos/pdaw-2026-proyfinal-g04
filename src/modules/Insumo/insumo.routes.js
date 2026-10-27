
import { Router } from "express";
import { InsumoController } from "./insumo.controller.js";

export default function crearRouterProductos(insumoController) {
    const router = Router();

    router.get("/", insumoController.listarInsumos);
    router.get("/:id", insumoController.buscarInsumo);
    router.post("/", insumoController.crearInsumo);
    router.put("/:id", insumoController.actualizarInsumo);
    router.delete("/:id", insumoController.eliminarInsumo);

    return router;
}
