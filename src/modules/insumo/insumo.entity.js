import { ValidationError, BadRequestError } from "../../common/errors/errors.classes.js";

export class Insumo {
    constructor({ id, nombre, categoria, descripcion = "", unidad, uso }) {
        if (!id) throw new ValidationError("id no puede ser nulo");
        if (!Number.isInteger(unidad) || unidad < 0) throw new BadRequestError("unidad debe ser un número entero mayor o igual a 0");
        if (!nombre) throw new BadRequestError("nombre no puede ser nulo");
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.unidad = unidad;
        this.uso = uso;
    }
}