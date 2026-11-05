export class ProductoService {
    constructor(productoRepository, cotizacionService) {
        this.productoRepository = productoRepository;
        this.cotizacionService = cotizacionService;
    }

    listarProductos() {
        return this.productoRepository.listar().map(producto => {
            const cotizacion = this.cotizacionService.buscarCotizacion(producto.idCotizacion);
            const { idCotizacion, ...productoSinCotizacion } = producto;
            return { ...productoSinCotizacion, cotizacion: cotizacion.venta, cotizacionFecha: cotizacion.fechaActualizacion };
        });
    }

    buscarProducto(id) {
        const producto = this.productoRepository.buscarPorId(id);

        if (!producto) {
            const error = new Error("producto no encontrado");
            error.status = 404;
            throw error;
        }

        const cotizacion = this.cotizacionService.buscarCotizacion(producto.idCotizacion);

        const { idCotizacion, ...productoSinCotizacion } = producto;
        console.log("Producto encontrado:", productoSinCotizacion);
        console.log("Cotización encontrada:", cotizacion);

        return { ...productoSinCotizacion, cotizacion: cotizacion.venta, cotizacionFecha: cotizacion.fechaActualizacion };
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
            const datosBase = { ...anterior, ...datos };
            productoActualizado = await this.productoRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }

        return productoActualizado;
    }

    async actualizarPreciosMasivo(productosActualizados) {
        try {
            this.productoRepository.iniciarTransaccion();
            const cotizacionActual = await this.cotizacionService.consultarCotizacion();
            for (const idProdModificado of productosActualizados) {
                const anterior = await this.productoRepository.buscarPorId(idProdModificado);
                
                if (anterior) {
                    const datosBase = {
                        ...anterior,
                        idCotizacion: cotizacionActual.id
                    };
                    await this.productoRepository.actualizar(datosBase);
                }
            }
            await this.productoRepository.confirmarTransaccion();
        } catch (error) {
            await this.productoRepository.rollback();
            error.status = 500;
            error.message = `Falló la actualización masiva de precios. Motivo: ${error.message}`;
            throw error;
        }
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
