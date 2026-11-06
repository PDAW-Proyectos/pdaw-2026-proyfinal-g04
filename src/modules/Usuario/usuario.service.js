import { NotFoundError } from "../../common/errors/errors.classes.js";

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