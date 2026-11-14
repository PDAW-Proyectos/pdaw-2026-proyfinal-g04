import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

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