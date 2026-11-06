import bcrypt from "bcrypt";
import { UnauthorizedError, ForbiddenError, ConflictError } from "../../common/errors/app.error.js";

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

}
