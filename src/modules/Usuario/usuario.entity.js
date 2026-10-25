export class Usuario {
    id
    email
    contraseña
    nombre
    apellido
    activo
    rol

    constructor({ id, email, contraseña, nombre, apellido, rol }) {
        if(!email || email.length === 0) {
            throw new Error("Email vacio")
        }
        this.id = id;
        this.email = email
        this.contraseña = contraseña
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
    }
}
