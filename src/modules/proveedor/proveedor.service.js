import { NotFoundError } from "../../common/errors/errors.classes.js";

export class ProveedorService {
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    listarProveedores(pagina, limite) {
        const { datos, ...paginacion } = this.proveedorRepository.listar(pagina, limite);
        return {
            proveedores: datos,
            ...paginacion,
        };
    }

    buscarProveedor(id) {
        const proveedor = this.proveedorRepository.buscarPorId(id);

        if (!proveedor) {
            throw new NotFoundError("Proveedor");
        }

        return proveedor;
    }

    async crearProveedor(datos) {
        return this.proveedorRepository.crear(datos);
    }

    async actualizarProveedor(id, datos) {
        const anterior = this.buscarProveedor(id);
        return this.proveedorRepository.actualizar({ ...anterior, ...datos });
    }

    async eliminarProveedor(id) {
        const eliminado = await this.proveedorRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Proveedor");
        }
    }
}
