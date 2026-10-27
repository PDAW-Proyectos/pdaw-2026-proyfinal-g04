export class ProductoService {
    productoRepository;

    constructor(productoRepository) {
        this.productoRepository = productoRepository
    }

    async listarProductos() {
        return this.productoRepository.listar();
    }

    async buscarProducto(id) {
        const producto = await this.productoRepository.buscarPorId(id);

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
            datos.tipo = unidad ? "ProductoUnidad" : "ProductoPeso";
            productoCreado = await this.productoRepository.crear(datos);
        } catch (error) {
            error.status = 400;
            throw error;
        }
        return productoCreado;
    }

    async actualizarProducto(id, datos) {
        let productoActualizado;
        const anterior = await this.productoRepository.buscarPorId(id);
        if (!anterior) {
            const error = new Error("producto no encontrado");
            error.status = 404;
            throw error;
        }
        
        try {
            const datosBase = Object.assign(anterior, datos);
            datos.tipo = unidad ? "ProductoUnidad" : "ProductoPeso";
            productoActualizado = await this.productoRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }

        return productoActualizado;
    }

    async eliminarProducto(id) {
        const eliminado = await this.productoRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("producto no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    }
}
