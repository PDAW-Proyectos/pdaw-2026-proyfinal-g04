
import { UserRepository } from "./usuario.repository.js";

export class UserService {
    userRepository;

    constructor(userRepository = new UserRepository()) {
        this.userRepository = userRepository;
    }

    async listarUsuarios() {
        return await this.userRepository.listar();
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
        return await this.userRepository.agregar(datos);
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
