export class Usuario {
    id
    email
    contraseña
    nombre
    apellido
    activo
    rol

    constructor({ id, email, contraseña, nombre, apellido, rol }) {

        this.id
        this.email = email
        this.contraseña = contraseña
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
    }
}
