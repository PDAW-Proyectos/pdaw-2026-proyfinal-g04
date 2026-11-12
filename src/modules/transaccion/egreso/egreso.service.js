import { BadRequestError, NotFoundError } from "../../../common/errors/errors.classes.js";

export class EgresoService {
    constructor(transaccionRepository, productoService, insumoService) {
        this.transaccionRepository = transaccionRepository;
        this.productoService = productoService
        this.insumoService = insumoService
    }

    listarEgresos = (pagina, limite) => {
        const { datos, ...paginacion } = this.transaccionRepository.listar(pagina, limite);
        return {
            egresos: datos,
            ...paginacion
        };
    };

    filtrarEgresos = (filtros, pagina, limite) => {
        const { datos, ...paginacion } = this.transaccionRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            egresos: datos,
            ...paginacion
        };
    };

    buscarEgreso = (id) => {
        const egreso = this.transaccionRepository.buscarPorId(id);

        if (!egreso) {
            throw new NotFoundError("Egreso");
        }

        return egreso;
    };

    crearEgreso = async (datos) => {
        if (datos.monto > 0) throw new BadRequestError("El monto debe ser menor o igual a cero para un egreso");
        return await this.transaccionRepository.crear(datos);
    };

    crearCompra = async (idUsuario, datos, { administrarTransacciones = true } = {}) => {
        if (!Array.isArray(datos.articulos)) {
            throw new BadRequestError("La lista de artículos debe ser un array");
        }

        const repositorios = [
            this.productoService.productoRepository,
            this.insumoService.insumoRepository,
            this.transaccionRepository
        ];

        const repositoriosUnicos = [...new Set(repositorios)];
        const iniciados = [];

        try {
            if (administrarTransacciones) {
                for (const repositorio of repositoriosUnicos) {
                    repositorio.iniciarTransaccion();
                    iniciados.push(repositorio);
                }
            }

            const articulos = [];

            for (const articulo of datos.articulos) {
                let resultado;
                console.log(articulo);
                

                if (articulo.tipo === "producto") {
                    resultado = articulo.id
                        ? await this.productoService.aumentarStock(articulo.id, articulo.unidad || articulo.peso)
                        : await this.productoService.crearProducto(articulo);
                } else if (articulo.tipo === "insumo") {
                    resultado = articulo.id
                        ? await this.insumoService.aumentarStock(articulo.id, articulo.unidad)
                        : await this.insumoService.crearInsumo(articulo);
                } else {
                    throw new BadRequestError(`Tipo de artículo inválido: ${articulo.tipo}`);
                }

                articulos.push({cantidad: articulo.unidad || articulo.peso, ...resultado});
            }

            console.log(articulos);
            

            const articulosParseados = articulos.map((articulo) => {return { id: articulo.id, cantidad: articulo.unidad, tipo: articulo.tipo }})

            const compra = await this.crearEgreso({
                idUsuario,
                idCaja: datos.idCaja,
                metodoDePago: datos.metodoDePago,
                articulos: articulosParseados,
                monto: datos.monto
            });

            if (administrarTransacciones) {
                for (const repositorio of repositoriosUnicos) {
                    await repositorio.confirmarTransaccion();
                }
            }

            return {
                ...compra, 
                articulos
            };
        } catch (error) {
            if (administrarTransacciones) {
                for (const repositorio of iniciados.reverse()) {
                    await repositorio.rollback();
                }
            }

            throw error;
        }
    };

    actualizarEgreso = async (id, datos) => {
        const anterior = await this.transaccionRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Egreso");
        }

        const datosBase = { ...anterior, ...datos };

        if (datosBase.monto > 0) {
            throw new BadRequestError("El monto debe ser menor o igual a cero para un egreso");
        }

        return await this.transaccionRepository.actualizar(datosBase);
    };

    eliminarEgreso = async (id) => {
        const eliminado = await this.transaccionRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Egreso");
        }

        return eliminado;
    };
}