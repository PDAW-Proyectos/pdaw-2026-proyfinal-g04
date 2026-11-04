import { Router } from "express";

export default function crearRouterCotizacion(cotizacionController) {
    const router = Router();
    router.get("/", cotizacionController.consultarCotizacion);
    router.get("/listar", cotizacionController.listarCotizaciones);
    router.get("/:id", cotizacionController.buscarCotizacion);

    return router
}