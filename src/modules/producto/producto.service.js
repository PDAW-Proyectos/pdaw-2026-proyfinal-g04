import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class ProductoService {
    constructor(productoRepository, cotizacionService, movimientoStockService, categoriaRepository, userRepository) {
        this.productoRepository = productoRepository;
        this.cotizacionService = cotizacionService;
        this.movimientoStockService = movimientoStockService;
        this.categoriaRepository = categoriaRepository;
        this.userRepository = userRepository;
    }

    agregarCotizacion = (producto) => {
        const cotizacion = this.cotizacionService.buscarCotizacion(producto.idCotizacion);
        const { idCotizacion, ...productoSinCotizacion } = producto;
        return { ...productoSinCotizacion, cotizacion: cotizacion.venta, cotizacionFecha: cotizacion.fechaActualizacion };
    };

    agregarCategoria = (producto) => {
        const categoria = this.categoriaRepository.buscarPorId(producto.idCategoria);
        return { ...producto, categoria };
    };

    listarProductos(pagina, limite) {
        let { datos, ...paginacion } = this.productoRepository.listar(pagina, limite);
        datos = datos.map(this.agregarCategoria)
        return {
            productos: datos.map(this.agregarCotizacion),
            ...paginacion
        };
    }

    filtrarProductos(filtros, pagina, limite) {
        const { datos, ...paginacion } = this.productoRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            productos: datos.map(this.agregarCotizacion),
            ...paginacion
        };
    }

    buscarProducto(id) {
        const producto = this.productoRepository.buscarPorId(id);

        if (!producto) {
            throw new NotFoundError("Producto");
        }
        const productoCategoria = this.agregarCategoria(producto)
        return this.agregarCotizacion(productoCategoria);
    }

    async crearProducto(datos, idUsuario, { administrarTransacciones = true } = {}) {
        const idCotizacion = (await this.cotizacionService.consultarCotizacion()).cotizacion.id
        return this._conTransaccionStock(async () => {
            const creado = await this.productoRepository.crear({ ...datos, idCotizacion });
            const stockInicial = creado.unidad !== undefined ? Number(creado.unidad) : Number(creado.peso);

            if (stockInicial > 0) {
                await this._registrarMovimientoStock({
                    producto: creado,
                    stockAnterior: 0,
                    stockNuevo: stockInicial,
                    tipo: "entrada",
                    motivo: datos.motivo || "Alta de producto con stock inicial",
                    idUsuario,
                });
            }

            return creado;
        }, administrarTransacciones);
    }

    async actualizarProducto(id, datos, idUsuario, { administrarTransacciones = true } = {}) {
        return this._conTransaccionStock(async () => {
            const anterior = await this.productoRepository.buscarPorId(id);

            if (!anterior) {
                throw new NotFoundError("Producto");
            }

            try {
                const datosBase = { ...anterior, ...datos };
                const actualizado = await this.productoRepository.actualizar(datosBase);

                const esPorUnidad = anterior.unidad !== undefined;
                const stockAnterior = esPorUnidad ? Number(anterior.unidad) : Number(anterior.peso);
                const stockNuevo = esPorUnidad ? Number(actualizado.unidad) : Number(actualizado.peso);

                if (stockNuevo !== stockAnterior) {
                    await this._registrarMovimientoStock({
                        producto: actualizado,
                        stockAnterior,
                        stockNuevo,
                        tipo: "ajuste",
                        motivo: datos.motivo || "Ajuste manual de inventario",
                        idUsuario,
                    });
                }

                return actualizado;
            } catch (error) {
                if (error instanceof TypeError) {
                    throw new BadRequestError(error.message);
                }
                throw error;
            }
        }, administrarTransacciones);
    }

    async actualizarPreciosMasivo(productosActualizar) {
        try {
            this.productoRepository.iniciarTransaccion();
            const cotizacionActual = await this.cotizacionService.consultarCotizacion();

            for (const idProdModificado of productosActualizar) {
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

    async actualizarPreciosPorcentaje(porcentaje, productosActualizar) {
        try {
            this.productoRepository.iniciarTransaccion();
            for (const idProdModificado of productosActualizar) {
                const anterior = await this.productoRepository.buscarPorId(idProdModificado);

                if (anterior) {
                    const cotizacion = await this.cotizacionService.buscarCotizacion(anterior.idCotizacion);
                    const precioArs = Math.round(anterior.precioUsd * cotizacion.venta / 10) * 10;
                    const precioArsPorcentaje = Math.round(precioArs * (1 + porcentaje / 100) / 10) * 10;
                    const precioUsdPorcentaje = Math.round(precioArsPorcentaje / cotizacion.venta * 100) / 100;
                    const datosBase = {
                        ...anterior,
                        precioUsd: precioUsdPorcentaje,
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

    async aumentarStock(id, cantidad, idUsuario, motivo = "Reposición de mercadería", { administrarTransacciones = true } = {}) {
        if (typeof cantidad !== "number" || !Number.isFinite(cantidad) || cantidad <= 0) {
            throw new BadRequestError("La cantidad debe ser un número positivo");
        }

        return this._conTransaccionStock(async () => {
            const producto = await this.productoRepository.buscarPorId(id);

            if (!producto) {
                throw new NotFoundError("Producto");
            }

            const esPorUnidad = producto.unidad !== undefined;
            const stockAnterior = esPorUnidad ? Number(producto.unidad) : Number(producto.peso);

            if (esPorUnidad) {
                producto.unidad += cantidad;
            } else {
                producto.peso += cantidad;
            }

            const stockNuevo = esPorUnidad ? Number(producto.unidad) : Number(producto.peso);
            const actualizado = await this.productoRepository.actualizar(producto);

            await this._registrarMovimientoStock({
                producto: actualizado,
                stockAnterior,
                stockNuevo,
                tipo: "entrada",
                motivo,
                idUsuario,
            });

            return actualizado;
        }, administrarTransacciones);
    }

    async disminuirStock(id, cantidad, idUsuario, motivo = "Venta", { administrarTransacciones = true } = {}) {
        if (typeof cantidad !== "number" || !Number.isFinite(cantidad) || cantidad <= 0) {
            throw new BadRequestError("La cantidad debe ser un número positivo");
        }

        return this._conTransaccionStock(async () => {
            const producto = await this.productoRepository.buscarPorId(id);

            if (!producto) {
                throw new NotFoundError("Producto");
            }

            const esPorUnidad = producto.unidad !== undefined;
            const stockAnterior = esPorUnidad ? Number(producto.unidad) : Number(producto.peso);

            if (stockAnterior < cantidad) {
                throw new BadRequestError("Stock insuficiente de " + producto.nombre);
            }
            if (esPorUnidad) {
                producto.unidad -= cantidad;
            } else {
                producto.peso -= cantidad;
            }

            const stockNuevo = esPorUnidad ? Number(producto.unidad) : Number(producto.peso);
            const actualizado = await this.productoRepository.actualizar(producto);

            await this._registrarMovimientoStock({
                producto: actualizado,
                stockAnterior,
                stockNuevo,
                tipo: "salida",
                motivo,
                idUsuario,
            });

            return actualizado;
        }, administrarTransacciones);
    }

    async _conTransaccionStock(operacion, administrarTransacciones) {
        if (!administrarTransacciones) {
            return operacion();
        }

        const repositorios = [
            this.productoRepository,
            this.movimientoStockService.movimientoStockRepository,
        ];
        const iniciados = [];

        try {
            for (const repositorio of repositorios) {
                repositorio.iniciarTransaccion();
                iniciados.push(repositorio);
            }

            const resultado = await operacion();

            for (const repositorio of iniciados) {
                await repositorio.confirmarTransaccion();
            }

            return resultado;
        } catch (error) {
            for (const repositorio of iniciados.reverse()) {
                await repositorio.rollback();
            }
            throw error;
        }
    }

    async _registrarMovimientoStock({ producto, stockAnterior, stockNuevo, tipo, motivo, idUsuario }) {
        if (!this.movimientoStockService || !this.categoriaRepository || !this.userRepository) {
            throw new Error("Faltan dependencias para registrar el movimiento de stock");
        }
        if (idUsuario === undefined) {
            throw new BadRequestError("El usuario que realiza el movimiento es obligatorio");
        }

        const cantidad = stockNuevo - stockAnterior;
        if (cantidad === 0) return;

        const esPorUnidad = producto.unidad !== undefined;
        const categoria = await this.categoriaRepository.buscarPorId(producto.idCategoria);
        if (!categoria) {
            throw new NotFoundError("Categoría");
        }

        let nombreUsuario = "Sistema";
        if (idUsuario !== null) {
            const usuario = await this.userRepository.buscarPorId(idUsuario);
            if (!usuario) {
                throw new NotFoundError("Usuario");
            }
            nombreUsuario = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim() || usuario.email;
        }

        await this.movimientoStockService.registrarMovimiento({
            idProducto: producto.id,
            nombreProducto: producto.nombre,
            idCategoria: producto.idCategoria,
            nombreCategoria: categoria.nombre,
            tipo,
            motivo,
            cantidad,
            unidadMedida: esPorUnidad ? "unidad" : producto.unidadMedida,
            stockAnterior,
            stockNuevo,
            idUsuario,
            nombreUsuario,
        });
    }
}
