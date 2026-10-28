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

    async aumentarStock(id, cantidad) {
        const producto = await this.buscarProducto(id);
        producto.unidad ? producto.unidad += cantidad : producto.peso += cantidad;
        return await this.productoRepository.actualizar(producto);
    }

    async disminuirStock(id, cantidad) {
        const producto = await this.buscarProducto(id);
        producto.unidad ? producto.unidad -= cantidad : producto.peso -= cantidad;
        return await this.productoRepository.actualizar(producto);
    }
}
