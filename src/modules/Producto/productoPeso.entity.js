import { Producto } from "./producto.entity.js";

export class ProductoPeso extends Producto {
    constructor({ id, nombre, categoria, descripcion, precio, precioUsd, peso }) {
        super({ id, nombre, categoria, descripcion, precio, precioUsd });
        if (peso < 0) throw new TypeError('peso no puede ser menor a 0');
        this.peso = peso;
    }
}