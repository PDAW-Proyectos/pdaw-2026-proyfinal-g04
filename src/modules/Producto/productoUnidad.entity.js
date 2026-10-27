import { Producto } from "./producto.entity.js";

export class ProductoUnidad extends Producto {
    constructor({ id, nombre, categoria, descripcion, precio, unidad }) {
        super({ id, nombre, categoria, descripcion, precio });
        if (unidad < 0) throw new TypeError('unidad no puede ser menor a 0');
        this.unidad = unidad;
    }
}