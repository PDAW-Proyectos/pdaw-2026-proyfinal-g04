
import path from "node:path";
import { Repository } from "../../repository.js";
import { __dirname } from "../../../server.js";

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

    async crearUsuario(datos) {
        return await this.userRepository.crear(datos);
    }

    async actualizarUsuario(id, datos) {
        const usuario = await this.userRepository.actualizar(
            id,
            datos
        );

        if (!usuario) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        return usuario;
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
