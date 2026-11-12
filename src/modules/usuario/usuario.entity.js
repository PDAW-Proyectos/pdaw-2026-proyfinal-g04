import { BadRequestError } from "../../common/errors/errors.classes.js"

export class Usuario {
    id
    email
    contraseña
    nombre
    apellido
    habilitado
    rol

    constructor({ id, email, contraseña, nombre, apellido, rol, habilitado }) {
        if(!email || email.length === 0) {
            throw new BadRequestError("Email vacio")
        }

        if(!contraseña || contraseña.length === 0) {
            throw new BadRequestError("Contraseña vacia")
        }

        this.id = id;
        this.email = email
        this.contraseña = contraseña
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
        this.habilitado = habilitado !== false;
    }
}
