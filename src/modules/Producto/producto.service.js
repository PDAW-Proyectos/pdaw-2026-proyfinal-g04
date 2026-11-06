import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class ProductoService {
    constructor(productoRepository, cotizacionService) {
        this.productoRepository = productoRepository;
        this.cotizacionService = cotizacionService;
    }

    listarProductos(pagina, limite) {
        const { datos, ...paginacion } = this.productoRepository.listar(pagina, limite);
        const datosConCotizacion = datos.map(producto => {
            const cotizacion = this.cotizacionService.buscarCotizacion(producto.idCotizacion);
            const { idCotizacion, ...productoSinCotizacion } = producto;
            return { ...productoSinCotizacion, cotizacion: cotizacion.venta, cotizacionFecha: cotizacion.fechaActualizacion };
        });
        return {
            productos: datosConCotizacion,
            ...paginacion
        };
    }

    filtrarProductos(filtros, pagina, limite) {
        const { datos, ...paginacion } = this.productoRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            productos: datos,
            ...paginacion
        };
    }

    buscarProducto(id) {
        const producto = this.productoRepository.buscarPorId(id);

        if (!producto) {
            throw new NotFoundError("Producto");
        }

        const cotizacion = this.cotizacionService.buscarCotizacion(producto.idCotizacion);

        const { idCotizacion, ...productoSinCotizacion } = producto;
        return { ...productoSinCotizacion, cotizacion: cotizacion.venta, cotizacionFecha: cotizacion.fechaActualizacion };
    }

    async crearProducto(datos) {
            return await this.productoRepository.crear(datos);
    }

    async actualizarProducto(id, datos) {
        const anterior = await this.productoRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Producto");
        }

        try {
            const datosBase = { ...anterior, ...datos };
            return await this.productoRepository.actualizar(datosBase);
        } catch (error) {
            if (error instanceof TypeError) {
                throw new BadRequestError(error.message);
            }
            throw error;
        }
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
                        idCotizacion: cotizacionActual.cotizacion.id
                    };
                    await this.productoRepository.actualizar(datosBase);
                }
            }

            await this.productoRepository.confirmarTransaccion();
        } catch (error) {
            await this.productoRepository.rollback();
            throw error;
        }
    }

    async eliminarProducto(id) {
        const eliminado = await this.productoRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Producto");
        }

        return eliminado;
    }

    async aumentarStock(id, cantidad) {
        if (typeof cantidad !== "number" || !Number.isFinite(cantidad) || cantidad <= 0) {
            throw new BadRequestError("La cantidad debe ser un número positivo");
        }

        const producto = await this.productoRepository.buscarPorId(id);

        if (!producto) {
            throw new NotFoundError("Producto");
        }

        if (producto.unidad !== undefined) {
            producto.unidad += cantidad;
        } else {
            producto.peso += cantidad;
        }

        return await this.productoRepository.actualizar(producto);
    }

    async disminuirStock(id, cantidad) {
        if (typeof cantidad !== "number" || !Number.isFinite(cantidad) || cantidad <= 0) {
            throw new BadRequestError("La cantidad debe ser un número positivo");
        }

        const producto = await this.productoRepository.buscarPorId(id);

        if (!producto) {
            throw new NotFoundError("Producto");
        }

        if (producto.unidad !== undefined) {
            if (producto.unidad < cantidad) {
                throw new BadRequestError("Stock insuficiente");
            }
            producto.unidad -= cantidad;
        } else {
            if (producto.peso < cantidad) {
                throw new BadRequestError("Stock insuficiente");
            }
            producto.peso -= cantidad;
        }

        return await this.productoRepository.actualizar(producto);
    }
}
