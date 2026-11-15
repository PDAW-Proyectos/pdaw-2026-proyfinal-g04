import { BadRequestError, NotFoundError, ConflictError } from "../../common/errors/errors.classes.js";

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

    obtenerNegocio = async () => ({
        negocio: (await this.obtenerConfiguracion()).configuracion.negocio
    });

    obtenerCajas = async () => ({
        cajas: (await this.obtenerConfiguracion()).configuracion.cajas ?? []
    });

    crearCajaConfiguracion = async (datos) => {
        const nombre = String(datos?.nombre ?? datos?.nroCaja ?? "").trim();

        if (!nombre) {
            throw new BadRequestError("El nombre de la caja es obligatorio");
        }

        const configuracion = (await this.obtenerConfiguracion()).configuracion;
        const cajas = [...(configuracion.cajas ?? [])];

        if (cajas.some((caja) => String(caja.nombre ?? caja).trim() === nombre)) {
            throw new ConflictError("Ya existe una caja con ese nombre");
        }

        cajas.push({ nombre });
        await this.configuracionRepository.actualizarConfiguracion({ cajas });

        return (await this.obtenerConfiguracion()).configuracion;
    };

    actualizarCajaConfiguracion = async (nombreActual, datos) => {
        const nombreViejo = String(nombreActual ?? "").trim();
        const nombreNuevo = String(datos?.nombre ?? datos?.nroCaja ?? "").trim();

        if (!nombreViejo) {
            throw new BadRequestError("El nombre actual de la caja es obligatorio");
        }

        if (!nombreNuevo) {
            throw new BadRequestError("El nombre de la caja es obligatorio");
        }

        const configuracion = (await this.obtenerConfiguracion()).configuracion;
        const cajas = [...(configuracion.cajas ?? [])];
        const indice = cajas.findIndex((caja) => String(caja.nombre ?? caja).trim() === nombreViejo);

        if (indice === -1) {
            throw new NotFoundError("Caja");
        }

        if (
            nombreViejo !== nombreNuevo &&
            cajas.some((caja) => String(caja.nombre ?? caja).trim() === nombreNuevo)
        ) {
            throw new ConflictError("Ya existe una caja con ese nombre");
        }

        cajas[indice] = { nombre: nombreNuevo };
        await this.configuracionRepository.actualizarConfiguracion({ cajas });

        return (await this.obtenerConfiguracion()).configuracion;
    };

    actualizarNegocio = async (datos) => {

        const negocio = {};

        for (const [campo, maximo] of [
            ["nombre", 120],
            ["telefono", 40],
            ["direccion", 200]
        ]) {
            if (datos[campo] === undefined) continue;

            const valor = datos[campo];

            if (
                typeof valor !== "string" ||
                valor.trim().length > maximo ||
                (campo === "nombre" && !valor.trim())
            ) {
                throw new BadRequestError(`El campo ${campo} no es válido`);
            }

            negocio[campo] = valor.trim();
        }

        if (!Object.keys(negocio).length) {
            throw new BadRequestError("No se enviaron datos del negocio");
        }

        await this.configuracionRepository.actualizarConfiguracion({ negocio });

        return (await this.obtenerConfiguracion()).configuracion;
    };

    actualizarExpiracion = async (minutos) => {
        if (!Number.isInteger(minutos) || minutos < 0 || minutos > 1440) {
            throw new BadRequestError(
                "La duración de sesión debe ser un número entero entre 0 y 1440 minutos"
            );
        }

        await this.configuracionRepository.actualizarConfiguracion({
            sessionExpiringTime: minutos * 60 * 1000
        });

        return (await this.obtenerConfiguracion()).configuracion;
    };

    actualizarStock = async (datos) => {
        const stockActual = this.configuracionRepository.configuracion.stock;

        const critico = datos.critico ?? stockActual.critico;
        const medio = datos.medio ?? stockActual.medio;

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

        await this.configuracionRepository.actualizarConfiguracion({
            stock: { critico, medio }
        });

        return (await this.obtenerConfiguracion()).configuracion;
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