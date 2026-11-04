import { Producto } from "./producto.entity.js";

export class ProductoPeso extends Producto {
    constructor({ id, idCotizacion, nombre, categoria, descripcion, precioUsd, peso }) {
        super({ id, idCotizacion, nombre, categoria, descripcion, precioUsd });
        if (peso < 0) throw new TypeError('peso no puede ser menor a 0');
        this.peso = peso;
    }
}