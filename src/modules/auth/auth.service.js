import bcrypt from "bcrypt";
import { UserService } from "../Usuario/usuario.service.js";

export class AuthService {
    userService;

    constructor(userService = new UserService()) {
        this.userService = userService;
    }

    async signup({ nombre, apellido, email, password, rol }) {
        const exists = await this.userService.buscarUsuarioPorEmail(email);
        if(exists) throw new Error("El email está en uso")
        const passwordHash = await bcrypt.hash(password, 12);

        const datos = {
            nombre,
            apellido,
            email,
            passwordHash,
            rol
        };

        return await this.userService.crearUsuario(datos);
    }

    async login({ email, password }) {
        const credenciales =
            await this.userService.buscarUsuarioPorEmail(email);

        if (
            !credenciales ||
            !(await bcrypt.compare(password, credenciales.passwordHash))
        ) {
            const error = new Error("Email o contraseña incorrectos");
            error.status = 401;
            throw error;
        }

        return {
            idUsuario: credenciales.idUsuario,
            mensaje: "Inicio de sesión exitoso"
        };
    }
}