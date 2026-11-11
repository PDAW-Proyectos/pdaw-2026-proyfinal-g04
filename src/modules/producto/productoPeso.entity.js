import { BadRequestError } from "../../common/errors/errors.classes.js";
import { Producto } from "./producto.entity.js";

const MEDIDAS_VALIDAS = ["g", "kg", "l", "ml"]

export class ProductoPeso extends Producto {
    constructor({ id, idCotizacion, nombre, categoria, descripcion, precioUsd, peso, unidadMedida }) {
        super({ id, idCotizacion, nombre, categoria, descripcion, precioUsd });
        if (peso < 0) throw new BadRequestError('peso no puede ser menor a 0');
        if (!unidadMedida || !MEDIDAS_VALIDAS.includes(unidadMedida)) throw new BadRequestError('La unidad de medida debe ser una de las siguientes:0 "g", "kg", "l", "ml"');
        this.peso = peso;
        this.unidadMedida = unidadMedida
    }
}
