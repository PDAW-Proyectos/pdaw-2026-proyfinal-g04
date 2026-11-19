import bcrypt from "bcrypt";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    UnauthorizedError
} from "../../common/errors/errors.classes.js";

function perfilPublico(usuario) {
    return {
        idUsuario: usuario.idUsuario ?? usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol ?? usuario.role
    };
}

export class AuthService {
    userService;

    constructor(userService) {
        this.userService = userService;
    }

    signup = async ({ nombre, apellido, email, password, rol }) => {
        const exists = await this.userService.buscarUsuarioPorEmail(email);
        
        if (exists) {
            throw new ConflictError("El email ya está en uso");
        }

        const contraseña = await bcrypt.hash(password, 12);
        
        const datos = {
            nombre,
            apellido,
            email,
            contraseña,
            rol
        };
        
        return this.userService.crearUsuario(datos);
    };
    
    login = async ({ email, password, requestedRole }) => {
        const credenciales = await this.userService.buscarUsuarioPorEmail(email);
    
        if(!credenciales.habilitado) throw new ConflictError("El usuario está deshabilitado")

        if (
            !credenciales ||
            !(await bcrypt.compare(
                password,
                credenciales.contraseña || credenciales.password
            ))
        ) {
            throw new UnauthorizedError("Email o contraseña incorrectos");
        }
    
        const rolReal = credenciales.rol || credenciales.role;
    
        if (requestedRole && rolReal !== "admin" && rolReal !== requestedRole) {
            throw new ForbiddenError(
                "No tenés permisos para ingresar a esta área"
            );
        }
    
        return {
            idUsuario: credenciales.idUsuario || credenciales.id,
            nombre: credenciales.nombre,
            email: credenciales.email,
            rol: rolReal,
            mensaje: "Inicio de sesión exitoso"
        };
    };

    me = (idUsuario) => {
        const usuario = this.userService.buscarUsuario(idUsuario);
        return perfilPublico(usuario);
    };

    actualizarPerfil = async (idUsuario, datos) => {
        if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
            throw new BadRequestError("Los datos del perfil no son válidos");
        }

        const camposPermitidos = ["nombre", "apellido", "email"];
        const camposDesconocidos = Object.keys(datos).filter(
            (campo) => !camposPermitidos.includes(campo)
        );

        if (camposDesconocidos.length) {
            throw new BadRequestError(
                "Solo se pueden actualizar nombre, apellido y email"
            );
        }

        const perfil = {};
        for (const campo of camposPermitidos) {
            const valor = datos[campo];
            if (typeof valor !== "string" || !valor.trim()) {
                throw new BadRequestError(`El campo ${campo} es obligatorio`);
            }
            perfil[campo] = valor.trim();
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) {
            throw new BadRequestError("El email no tiene un formato válido");
        }

        const usuarioActual = this.userService.buscarUsuario(idUsuario);
        const usuarioConEmail = this.userService.buscarUsuarioPorEmail(perfil.email);
        const idActual = usuarioActual.idUsuario ?? usuarioActual.id;
        const idConEmail = usuarioConEmail?.idUsuario ?? usuarioConEmail?.id;

        if (
            usuarioConEmail &&
            String(idConEmail) !== String(idActual)
        ) {
            throw new ConflictError("El email ya está en uso");
        }

        const usuarioActualizado = await this.userService.actualizarUsuario(
            idUsuario,
            perfil
        );

        return perfilPublico(usuarioActualizado);
    };

    logout = async (session) => {
        return new Promise((resolve, reject) => {
            session.destroy((error) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    };

}
