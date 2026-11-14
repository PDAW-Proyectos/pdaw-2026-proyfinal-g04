import { ValidationError, BadRequestError } from "../../common/errors/errors.classes.js";

export class Categoria {
    constructor({ id, nombre, productos }) {
        if (!id) throw new ValidationError("id no puede ser nulo");
        if (!nombre.trim()) throw new BadRequestError("nombre no puede ser nulo");
        this.id = id,
        this.nombre = nombre
        this.productos = productos || []
    }
}

