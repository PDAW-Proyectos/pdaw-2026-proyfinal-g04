import { MovimientoStock } from "./movimiento.stock.entity.js";

export class MovimientoStockService {
  constructor(movimientoStockRepository) {
    this.movimientoStockRepository = movimientoStockRepository;
  }

  registrarMovimiento(datos) {
    const nuevoMovimiento = new MovimientoStock(datos);
    return this.movimientoStockRepository.crear(nuevoMovimiento);
  }

  listarMovimientos(pagina = 1, limite = 10, filtros = {}) {
    const tieneFiltros = Object.keys(filtros).length > 0;

    if (tieneFiltros && typeof this.movimientoStockRepository.listarPorPropiedades === "function") {
      return this.movimientoStockRepository.listarPorPropiedades(filtros, pagina, limite);
    }

    return this.movimientoStockRepository.listar(pagina, limite);
  }
}