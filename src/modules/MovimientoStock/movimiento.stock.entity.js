import { BadRequestError } from "../../common/errors/errors.classes.js";

const TIPOS_MOVIMIENTO = new Set(["entrada", "salida", "ajuste"]);
const UNIDADES_MEDIDA = new Set(["unidad", "g", "kg", "l", "ml"]);

export class MovimientoStock {
  constructor({
    id,
    fecha = new Date().toISOString(),
    idProducto,
    nombreProducto,
    idCategoria,
    nombreCategoria,
    tipo,
    motivo,
    cantidad,
    unidadMedida,
    stockAnterior,
    stockNuevo,
    idUsuario,
    nombreUsuario,
  }) {
    const cantidadNumerica = Number(cantidad);
    const stockAnteriorNumerico = Number(stockAnterior);
    const stockNuevoNumerico = Number(stockNuevo);

    if (!Number.isInteger(Number(idProducto)) || Number(idProducto) <= 0) {
      throw new BadRequestError("idProducto debe ser un entero positivo");
    }
    if (!Number.isInteger(Number(idCategoria)) || Number(idCategoria) <= 0) {
      throw new BadRequestError("idCategoria debe ser un entero positivo");
    }
    if (idUsuario === undefined) {
      throw new BadRequestError("idUsuario es obligatorio; use null para movimientos del sistema");
    }
    if (
      idUsuario !== null
      && (!Number.isInteger(Number(idUsuario)) || Number(idUsuario) <= 0)
    ) {
      throw new BadRequestError("idUsuario debe ser un entero positivo o null");
    }
    if (typeof nombreProducto !== "string" || !nombreProducto.trim()) {
      throw new BadRequestError("nombreProducto es obligatorio");
    }
    if (typeof nombreCategoria !== "string" || !nombreCategoria.trim()) {
      throw new BadRequestError("nombreCategoria es obligatorio");
    }
    if (typeof nombreUsuario !== "string" || !nombreUsuario.trim()) {
      throw new BadRequestError("nombreUsuario es obligatorio");
    }
    if (!TIPOS_MOVIMIENTO.has(tipo)) {
      throw new BadRequestError("tipo debe ser entrada, salida o ajuste");
    }
    if (typeof motivo !== "string" || !motivo.trim()) {
      throw new BadRequestError("motivo es obligatorio");
    }
    if (!UNIDADES_MEDIDA.has(unidadMedida)) {
      throw new BadRequestError("unidadMedida no es válida");
    }
    if (typeof fecha !== "string" || Number.isNaN(Date.parse(fecha))) {
      throw new BadRequestError("fecha debe ser una fecha válida");
    }
    if (
      !Number.isFinite(cantidadNumerica)
      || !Number.isFinite(stockAnteriorNumerico)
      || !Number.isFinite(stockNuevoNumerico)
      || cantidadNumerica === 0
      || stockAnteriorNumerico < 0
      || stockNuevoNumerico < 0
    ) {
      throw new BadRequestError("La variación y los stocks deben ser números válidos");
    }

    const tolerancia = Number.EPSILON
      * Math.max(1, Math.abs(cantidadNumerica), Math.abs(stockAnteriorNumerico), Math.abs(stockNuevoNumerico))
      * 8;
    if (Math.abs(stockNuevoNumerico - stockAnteriorNumerico - cantidadNumerica) > tolerancia) {
      throw new BadRequestError("La variación debe coincidir con la diferencia entre stockNuevo y stockAnterior");
    }
    if (
      (tipo === "entrada" && cantidadNumerica < 0)
      || (tipo === "salida" && cantidadNumerica > 0)
    ) {
      throw new BadRequestError("El signo de la variación no coincide con el tipo de movimiento");
    }

    this.id = id;
    this.fecha = fecha;
    this.idProducto = Number(idProducto);
    this.nombreProducto = nombreProducto.trim();
    this.idCategoria = Number(idCategoria);
    this.nombreCategoria = nombreCategoria.trim();
    this.tipo = tipo;
    this.motivo = motivo.trim();
    this.cantidad = cantidadNumerica;
    this.unidadMedida = unidadMedida;
    this.stockAnterior = stockAnteriorNumerico;
    this.stockNuevo = stockNuevoNumerico;
    this.idUsuario = idUsuario === null ? null : Number(idUsuario);
    this.nombreUsuario = nombreUsuario.trim();
  }
}
