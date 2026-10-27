export class UserService {
    userRepository;

    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    listarUsuarios = async () => {
        return await this.userRepository.listar();
    };

    buscarUsuario = async (id) => {
        const usuario = await this.userRepository.buscarPorId(id);

        if (!usuario) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        return usuario;
    };

    buscarUsuarioPorEmail = async (email) => {
        return await this.userRepository.buscarPorPropiedad({ email: email });
    };

    crearUsuario = async (datos) => {
        datos.tipo = "Usuario";
        return await this.userRepository.crear(datos);
    };

    actualizarUsuario = async (id, datos) => {
        const anterior = await this.userRepository.buscarPorId(id);

        if (!anterior) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        try {
            const datosBase = Object.assign(anterior, datos);
            datosBase.tipo = "Usuario";

            return await this.userRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }
    };

    eliminarUsuario = async (id) => {
        const eliminado = await this.userRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    };
}