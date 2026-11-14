import { Router } from "express";

export const crearRouterCategorias = (categoriasController) => {
    const router = Router();

    router.get("/", categoriasController.listarCategorias);
    router.get("/:id", categoriasController.buscarCategoria);
    router.query("/", categoriasController.filtrarCategorias);
    router.post("/", categoriasController.crearCategoria);
    router.patch("/:id/nombre", categoriasController.actualizarNombreCategoria)
    router.patch("/:id/productos", categoriasController.actualizarProductosCategoria)
    router.delete("/:id", categoriasController.eliminarCategoria);

    return router;
};