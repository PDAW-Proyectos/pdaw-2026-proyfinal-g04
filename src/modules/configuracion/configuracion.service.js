import {
    BadRequestError,
    ConflictError,
    NotFoundError
} from "../../common/errors/errors.classes.js";

export class ConfiguracionService {
    constructor(configuracionRepository, productoRepository = null) {
        this.configuracionRepository = configuracionRepository;
        this.productoRepository = productoRepository;
    }

    obtenerConfiguracion = async () => {
        const configuracion = this.configuracionRepository.configuracion;

        if (!configuracion) {
            throw new NotFoundError("La configuración no existe");
        }

        return {
            configuracion: {
                ...configuracion,
                sessionDurationMinutes: Math.round(
                    configuracion.sessionExpiringTime / 60 / 1000
                )
            }
        };
    };

    obtenerSesion = async () => ({
        sessionExpiringTime: (await this.obtenerConfiguracion()).configuracion.sessionExpiringTime
    });

    obtenerStock = async () => ({
        stock: (await this.obtenerConfiguracion()).configuracion.stock
    });

    actualizarConfiguracion = async (datos) => {
        if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
            throw new BadRequestError("La configuración enviada no es válida");
        }

        const actualizaciones = {};
        const tiene = (objeto, propiedad) =>
            Object.prototype.hasOwnProperty.call(objeto, propiedad);

        if (tiene(datos, "negocio")) {
            const negocio = datos.negocio;
            if (!negocio || typeof negocio !== "object" || Array.isArray(negocio)) {
                throw new BadRequestError("Los datos del negocio no son válidos");
            }

            const negocioActualizado = {};
            for (const [campo, maximo] of [
                ["nombre", 120],
                ["telefono", 40],
                ["direccion", 200]
            ]) {
                if (!tiene(negocio, campo)) continue;
                const valor = negocio[campo];
                if (
                    typeof valor !== "string" ||
                    valor.trim().length > maximo ||
                    (campo === "nombre" && valor.trim().length === 0)
                ) {
                    throw new BadRequestError(`El campo ${campo} no es válido`);
                }
                negocioActualizado[campo] = valor.trim();
            }

            if (Object.keys(negocioActualizado).length === 0) {
                throw new BadRequestError("No se enviaron datos del negocio");
            }
            actualizaciones.negocio = negocioActualizado;
        }

        if (tiene(datos, "sessionDurationMinutes")) {
            const minutos = datos.sessionDurationMinutes;
            if (!Number.isInteger(minutos) || minutos < 0 || minutos > 24 * 60) {
                throw new BadRequestError(
                    "La duración de sesión debe ser un número entero entre 0 y 1440 minutos"
                );
            }
            actualizaciones.sessionExpiringTime = minutos * 60 * 1000;
        }

        if (tiene(datos, "stock")) {
            const stock = datos.stock;
            if (!stock || typeof stock !== "object" || Array.isArray(stock)) {
                throw new BadRequestError("Los umbrales de stock no son válidos");
            }
            const stockActual = this.configuracionRepository.configuracion.stock;
            const critico = tiene(stock, "critico") ? stock.critico : stockActual.critico;
            const medio = tiene(stock, "medio") ? stock.medio : stockActual.medio;

            if (
                !Number.isInteger(critico) ||
                !Number.isInteger(medio) ||
                critico < 0 ||
                medio <= critico
            ) {
                throw new BadRequestError(
                    "El stock crítico debe ser un entero no negativo y menor al stock medio"
                );
            }

            actualizaciones.stock = { critico, medio };
        }

        if (Object.keys(actualizaciones).length === 0) {
            throw new BadRequestError("No se enviaron opciones de configuración");
        }

        await this.configuracionRepository.actualizarConfiguracion(actualizaciones);
        return (await this.obtenerConfiguracion()).configuracion;
    };

    listarCategorias = async () => {
        const productos = this.productoRepository?.entidades ?? [];
        const categoriasGuardadas = this.configuracionRepository.entidades;
        const normalizar = (nombre) => nombre.trim().toLocaleLowerCase("es");

        for (const nombre of new Set(
            productos
                .map((producto) => producto.categoria?.trim())
                .filter(Boolean)
        )) {
            if (
                !categoriasGuardadas.some(
                    (categoria) => normalizar(categoria.nombre) === normalizar(nombre)
                )
            ) {
                await this.configuracionRepository.crear({ nombre });
            }
        }

        return this.configuracionRepository.entidades.map((categoria) => ({
            ...categoria,
            productos: productos
                .filter(
                    (producto) =>
                        producto.categoria &&
                        normalizar(producto.categoria) === normalizar(categoria.nombre)
                )
                .map((producto) => producto.nombre)
        }));
    };

    crearCategoria = async (nombre) => {
        if (typeof nombre !== "string" || nombre.trim().length === 0 || nombre.trim().length > 80) {
            throw new BadRequestError("El nombre de la categoría no es válido");
        }

        const categorias = await this.listarCategorias();
        const normalizado = nombre.trim().toLocaleLowerCase("es");
        if (
            categorias.some(
                (categoria) => categoria.nombre.toLocaleLowerCase("es") === normalizado
            )
        ) {
            throw new ConflictError("Ya existe una categoría con ese nombre");
        }

        const categoria = await this.configuracionRepository.crear({
            nombre: nombre.trim()
        });
        return { ...categoria, productos: [] };
    };

    eliminarCategoria = async (id) => {
        const categoriaId = Number(id);
        const categoria = Number.isInteger(categoriaId)
            ? this.configuracionRepository.buscarPorId(categoriaId)
            : null;

        if (!categoria) {
            throw new NotFoundError("Categoría");
        }

        const normalizado = categoria.nombre.trim().toLocaleLowerCase("es");
        const tieneProductos = (this.productoRepository?.entidades ?? []).some(
            (producto) =>
                producto.categoria?.trim().toLocaleLowerCase("es") === normalizado
        );
        if (tieneProductos) {
            throw new ConflictError(
                `No se puede eliminar "${categoria.nombre}" porque tiene productos asociados`
            );
        }

        await this.configuracionRepository.eliminar(categoriaId);
    };

    actualizarDuracionSesion = async (datos) => {
        let { duracionHoras } = datos
        if (!Number.isInteger(duracionHoras) || duracionHoras <= 0 || duracionHoras > 24) {
            throw new BadRequestError("La duración debe ser un número entero mayor a cero y menor o igual a 24");
        }

        const duracionSesion = duracionHoras * 60 * 60 * 1000;
        duracionHoras = duracionSesion / 60 / 60 / 1000

        await this.configuracionRepository.actualizarConfiguracion({
            sessionExpiringTime: duracionSesion
        });

        return {
            duracionHoras,
            duracionSesion
        };
    };
}