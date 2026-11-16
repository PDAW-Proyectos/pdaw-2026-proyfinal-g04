import { BadRequestError, ValidationError } from "../../common/errors/errors.classes.js";

export class Proveedor {
    constructor({ id, empresa, rubro, contacto, telefono, estado = "Activo" }) {
        if (!id) throw new ValidationError("id no puede ser nulo");

        for (const [campo, valor] of Object.entries({ empresa, rubro, contacto, telefono })) {
            if (typeof valor !== "string" || valor.trim() === "") {
                throw new BadRequestError(`${campo} no puede ser nulo`);
            }
        }

        if (!["Activo", "Inactivo"].includes(estado)) {
            throw new BadRequestError("estado debe ser Activo o Inactivo");
        }

        this.id = id;
        this.empresa = empresa.trim();
        this.rubro = rubro.trim();
        this.contacto = contacto.trim();
        this.telefono = telefono.trim();
        this.estado = estado;
    }
}
