export class EgresoService {
    constructor(transaccionRepository, productoService, insumoService) {
        this.transaccionRepository = transaccionRepository;
        this.productoService = productoService
        this.insumoService = insumoService
    }

    listarEgresos = async () => {
        return await this.transaccionRepository.listar();
    };

    buscarEgreso = async (id) => {
        const egreso = await this.transaccionRepository.buscarPorId(id);

        if (!egreso) {
            const error = new Error("Egreso no encontrado");
            error.status = 404;
            throw error;
        }

        return egreso;
    };

    crearEgreso = async (datos) => {
        return await this.transaccionRepository.crear(datos);
    };

    crearCompra = async (idUsuario, datos) => {
        const repositorios = [
            this.productoService.productoRepository,
            this.insumoService.insumoRepository,
            this.transaccionRepository
        ];

        const repositoriosUnicos = [...new Set(repositorios)];
        const iniciados = [];

        try {
            for (const repositorio of repositoriosUnicos) {
                repositorio.iniciarTransaccion();
                iniciados.push(repositorio);
            }

            const articulos = [];

            for (const articulo of datos.listaArticulos) {
                let resultado;

                if (articulo.tipo === "producto") {
                    resultado = articulo.id
                        ? await this.productoService.aumentarStock(
                            articulo.id,
                            articulo.unidad || articulo.peso
                        )
                        : await this.productoService.crearProducto(articulo);
                } else if (articulo.tipo === "insumo") {
                    resultado = articulo.id
                        ? await this.insumoService.aumentarStock(
                            articulo.id,
                            articulo.unidad
                        )
                        : await this.insumoService.crearInsumo(articulo);
                } else {
                    throw new Error(
                        `Tipo de artículo inválido: ${articulo.tipo}`
                    );
                }

                articulos.push(resultado);
            }

            const compra = await this.transaccionRepository.crear({
                idUsuario,
                metodoDePago: datos.metodoDePago,
                articulos,
                monto: datos.monto
            });

            for (const repositorio of repositoriosUnicos) {
                await repositorio.confirmarTransaccion();
            }

            return compra;
        } catch (error) {
            for (const repositorio of iniciados.reverse()) {
                await repositorio.rollback();
            }

            throw error;
        }
    };


    actualizarEgreso = async (id, datos) => {
        const anterior = await this.transaccionRepository.buscarPorId(id);

        if (!anterior) {
            const error = new Error("Egreso no encontrado");
            error.status = 404;
            throw error;
        }

        try {
            const datosBase = Object.assign(anterior, datos);
            return await this.transaccionRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }
    };

    eliminarEgreso = async (id) => {
        const eliminado = await this.transaccionRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("Egreso no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    };
}