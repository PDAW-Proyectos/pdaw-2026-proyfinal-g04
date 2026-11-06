import { NotFoundError } from "../../common/errors/errors.classes.js";

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
            throw new NotFoundError("Usuario");
        }

        return usuario;
    };

    buscarUsuarioPorEmail = (email) => {
        return this.userRepository.buscarPorPropiedades({ email });
    };

    crearUsuario = async (datos) => {
        return await this.userRepository.crear(datos);
    };

    actualizarUsuario = async (id, datos) => {
        const anterior = this.userRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Usuario");
        }

        const datosBase = { ...anterior, ...datos };
        return await this.userRepository.actualizar(datosBase);
    };

    eliminarUsuario = async (id) => {
        const eliminado = await this.userRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Usuario");
        }

        return eliminado;
    };
}