export class Insumo {
    constructor({ id, nombre, categoria, descripcion, unidad, uso }) {
        if (!id) throw new TypeError('id no puede ser nulo');
        if (!Number.isInteger(unidad) || unidad < 0) throw new TypeError('unidad debe ser un número mayor o igual a 0');
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.unidad = unidad;
        this.uso = uso;
    }
}