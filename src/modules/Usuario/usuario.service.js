export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    listarUsuarios = (pagina, limite) => {
        const { datos, ...paginacion } = this.userRepository.listar(pagina, limite);
        return {
            usuarios: datos,
            ...paginacion
        };
    };

    filtrarUsuarios = (filtros, pagina, limite) => {
        const { datos, ...paginacion } = this.userRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            usuarios: datos,
            ...paginacion
        };
    };

    buscarUsuario = (id) => {
        const usuario = this.userRepository.buscarPorId(id);

        if (!usuario) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            throw error;
        }

        return usuario;
    };

    buscarUsuarioPorEmail = (email) => {
        return this.userRepository.buscarPorPropiedades({ email: email });
    };

    crearUsuario = async (datos) => {
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
            const datosBase = { ...anterior, ...datos };
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