export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    listarUsuarios = async (pagina, limite) => {
        const { datos, ...paginacion } = await this.userRepository.listar(pagina, limite);
        return {
            usuarios: datos,
            ...paginacion
        };
    };

    filtrarUsuarios = async (filtros, pagina, limite) => {
        const { datos, ...paginacion } = await this.userRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            usuarios: datos,
            ...paginacion
        };
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
        return await this.userRepository.buscarPorPropiedades({ email: email });
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