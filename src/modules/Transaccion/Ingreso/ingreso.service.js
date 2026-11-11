import { BadRequestError, NotFoundError } from "../../../common/errors/errors.classes.js";

export class IngresoService {
    transaccionRepository;

    constructor(transaccionRepository, productoService) {
        this.transaccionRepository = transaccionRepository;
        this.productoService = productoService
    }

    listarIngresos = (pagina, limite) => {
        const { datos, ...paginacion } = this.transaccionRepository.listar(pagina, limite);
        return {
            ingresos: datos,
            ...paginacion
        };
    };

    filtrarIngresos = (filtros, pagina, limite) => {
        const { datos, ...paginacion } = this.transaccionRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            ingresos: datos,
            ...paginacion
        };
    };

    buscarIngreso = (id) => {
        const ingreso = this.transaccionRepository.buscarPorId(id);

        if (!ingreso) {
            throw new NotFoundError("Ingreso");
        }

        return ingreso;
    };

    crearIngreso = async (datos) => {
        if (datos.monto < 0) throw new BadRequestError("El monto debe ser mayor o igual a cero para un ingreso");
        return await this.transaccionRepository.crear(datos);
    };

    crearVenta = async ( idUsuario, datos,  { administrarTransacciones = true } = {} ) => {
        if (!Array.isArray(datos.articulos)) {
            throw new BadRequestError("La lista de artículos debe ser un array");
        }

        const repositorios = [
            this.productoService.productoRepository,
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
                const resultado = await this.productoService.disminuirStock(articulo.id, articulo.unidad || articulo.peso);
                articulos.push(resultado);
            }

            const venta = await this.crearIngreso({
                idUsuario,
                idCaja: datos.idCaja,
                metodoDePago: datos.metodoDePago,
                articulos,
                monto: datos.monto
            });

            if (administrarTransacciones) {
                for (const repositorio of repositoriosUnicos) {
                    await repositorio.confirmarTransaccion();
                }
            }

            return venta;
        } catch (error) {
            if (administrarTransacciones) {
                for (const repositorio of iniciados.reverse()) {
                    await repositorio.rollback();
                }
            }

            throw error;
        }
    };

    actualizarIngreso = async (id, datos) => {
        const anterior = this.transaccionRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Ingreso");
        }
        if (datos?.monto < 0) {
            throw new BadRequestError("El monto debe ser mayor o igual a cero para un ingreso");
        }

        const datosBase = { ...anterior, ...datos };
        return await this.transaccionRepository.actualizar(datosBase);
    };

    eliminarIngreso = async (id) => {
        const eliminado = await this.transaccionRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Ingreso");
        }

        return eliminado;
    };
}