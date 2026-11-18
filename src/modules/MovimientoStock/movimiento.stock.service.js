import { MovimientoStock } from "./movimiento.stock.entity.js";
import { coincidePropiedad } from "../../common/utils/repository.utils.js";

export class MovimientoStockService {
  constructor(movimientoStockRepository) {
    this.movimientoStockRepository = movimientoStockRepository;
  }

  registrarMovimiento(datos) {
    const nuevoMovimiento = new MovimientoStock(datos);
    return this.movimientoStockRepository.crear(nuevoMovimiento);
  }

  listarMovimientos(pagina = 1, limite = 10, filtros = {}) {
    const { datos } = this.movimientoStockRepository.listar();
    const movimientos = datos
      .filter((movimiento) => coincidePropiedad(movimiento, filtros))
      .sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
    const total = movimientos.length;

    return {
      datos: movimientos.slice((pagina - 1) * limite, pagina * limite),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }
}