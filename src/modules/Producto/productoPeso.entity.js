import { Producto } from "./producto.entity.js";

export class ProductoPeso extends Producto {
    constructor({ id, nombre, categoria, descripcion, precio, peso }) {
        super({ id, nombre, categoria, descripcion, precio });
        if (peso < 0) throw new TypeError('peso no puede ser menor a 0');
        this.peso = peso;
    }
}