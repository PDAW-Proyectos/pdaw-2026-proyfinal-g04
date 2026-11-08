import {
  ValidationError,
  BadRequestError,
} from "../../common/errors/errors.classes.js";

export class Producto {
  constructor({ id, idCotizacion, nombre, categoria, descripcion, precioUsd }) {
    if (new.target === Producto)
      throw new TypeError("Producto es una clase abstracta");
    if (!id) throw new ValidationError("id no puede ser nulo");
    if (
      precioUsd !== undefined &&
      (typeof precioUsd !== "number" || isNaN(precioUsd) || precioUsd < 0)
    ) {
      throw new BadRequestError(
        "precioUsd debe ser un número válido mayor o igual a 0",
      );
    }
    if (!nombre) throw new BadRequestError("nombre no puede ser nulo");
    this.id = id;
    this.idCotizacion = idCotizacion;
    this.nombre = nombre;
    this.categoria = categoria;
    this.descripcion = descripcion;
    this.precioUsd = precioUsd;
  }
}
