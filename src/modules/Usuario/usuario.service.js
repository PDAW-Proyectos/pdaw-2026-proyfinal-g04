
import path from "node:path";
import { Repository } from "../../repository.js";
import { __dirname } from "../../server.js";
import { Usuario } from "./Usuario.entity.js";

const RUTA_USUARIOS = path.join(__dirname, "data", "Usuarios.json");

export class UserService {
    userRepository;

    constructor(userRepository = Repository.inicializar(RUTA_USUARIOS)) {
        this.userRepository = userRepository
    }

    async listarUsuarios() {
        return this.userRepository.listar();
    }

    async buscarUsuario(id) {
        const usuario = await this.userRepository.buscarPorId(id);

        if (!usuario) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        return usuario;
    }

    async buscarUsuarioPorEmail(email) {
        const usuario = await (await this.userRepository).buscarPorPropiedad(email);
        return usuario;
    }

    async crearUsuario(datos) {
        const usuario = new Usuario(datos)
        return await this.userRepository.crear(usuario);
    }

    async actualizarUsuario(id, datos) {
            const anterior = await this.userRepository.buscarPorId(id)
            let usuario
            if(!anterior) {
                const error = new Error =("Usuario no encontrado")
                error.status = 404
                throw error
            }
            try {
                const datosBase = Object.assign(anterior, datos)
                usuario = await this.userRepository.actualizar(datosBase);
            } catch (error) {
                error.status = 400
                throw error
            }
            
        return usuario
    }

    async eliminarUsuario(id) {
        const eliminado = await this.userRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    }
}
