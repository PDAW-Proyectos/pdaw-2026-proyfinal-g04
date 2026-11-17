import { Router } from "express";

export function crearRouterMovimientosStock(movimientoStockController, middlewaresAuth = []) {
  const router = Router();

  router.get("/", ...middlewaresAuth, movimientoStockController.listarMovimientos);

  return router;
}