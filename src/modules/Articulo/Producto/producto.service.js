export class ProductoService {
    articuloRepository;

    constructor(articuloRepository) {
        this.articuloRepository = articuloRepository
    }

    async listarProductos() {
        return this.articuloRepository.listar();
    }

    async buscarProducto(id) {
        const producto = await this.articuloRepository.buscarPorId(id);

        if (!producto) {
            const error = new Error("producto no encontrado");
            error.status = 404;
            throw error;
        }

        return producto;
    }

    async crearProducto(datos) {
        let productoCreado;
        try {
            productoCreado = await this.articuloRepository.crear(datos);
        } catch (error) {
            error.status = 400;
            throw error;
        }
        return productoCreado;
    }

    async actualizarProducto(id, datos) {
        let productoActualizado;
        const anterior = await this.articuloRepository.buscarPorId(id);
        if (!anterior) {
            const error = new Error("producto no encontrado");
            error.status = 404;
            throw error;
        }
        
        try {
            const datosBase = Object.assign(anterior, datos);
            datosBase.tipo = "producto";
            productoActualizado = await this.articuloRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }

        return productoActualizado;
    }

    async eliminarProducto(id) {
        const eliminado = await this.articuloRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("producto no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    }
}
