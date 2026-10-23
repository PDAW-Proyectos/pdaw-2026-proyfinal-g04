export class Usuario {
    id
    email
    contraseña
    nombre
    apellido
    activo
    rol

    constructor({ id, email, passwordHash, nombre, apellido, rol }) {

        this.id
        this.email = email
        this.contraseña = passwordHash
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
    }
}
