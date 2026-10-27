
import { Repository } from "../../repository.js";
import { Usuario } from "./usuario.entity.js";

export class UserService {
    userRepository;

    constructor(userRepository) {
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
        const usuario = await this.userRepository.buscarPorPropiedad({email: email});
        return usuario;
    }

    async crearUsuario(datos) {
        datos.tipo = "Usuario"
        return await this.userRepository.crear(datos);
    }

    async actualizarUsuario(id, datos) {
            const anterior = await this.userRepository.buscarPorId(id)
            let usuario
            if(!anterior) {
                const error = new Error ("Usuario no encontrado")
                error.status = 404
                throw error
            }
            try {
                const datosBase = Object.assign(anterior, datos)
                datosBase.tipo = "Usuario"
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
