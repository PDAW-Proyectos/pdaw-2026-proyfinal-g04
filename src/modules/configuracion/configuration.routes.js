import { Router } from "express";

export const crearRouterConfiguracion = (configuracionController) => {
    const router = Router();

    router.get("/", configuracionController.obtenerConfiguracion);
    router.patch("/", configuracionController.actualizarConfiguracion);
    router.get("/sesion", configuracionController.obtenerSesion);
    router.patch("/sesion", configuracionController.actualizarDuracionSesion);
    router.get("/categorias", configuracionController.listarCategorias);
    router.post("/categorias", configuracionController.crearCategoria);
    router.delete("/categorias/:id", configuracionController.eliminarCategoria);

    return router;
};