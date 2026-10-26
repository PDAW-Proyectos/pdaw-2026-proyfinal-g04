import { Articulo } from "../articulo.entity.js"

export class Producto extends Articulo {
    precio;

    constructor({ id, nombre, categoria, descripcion, stock, precio }) {
        super({ id, nombre, categoria, descripcion, stock });
        if (!Number.isInteger(precio)) throw new TypeError('precio debe ser un número entero mayor o igual a 0');
        this.precio = precio;
    }
}