import { BadRequestError } from "../../common/errors/errors.classes.js";
import { Producto } from "./producto.entity.js";

export class ProductoUnidad extends Producto {
    constructor({ id, idCotizacion, nombre, categoria, descripcion, precioUsd, unidad }) {
        super({ id, idCotizacion, nombre, categoria, descripcion, precioUsd });
        if (unidad < 0) throw new BadRequestError('unidad no puede ser menor a 0');
        this.unidad = unidad;
    }
}