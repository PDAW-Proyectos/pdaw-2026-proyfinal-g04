import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class ConfiguracionService {
    constructor(configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    obtenerConfiguracion = async () => {
        const configuracion = this.configuracionRepository.configuracion;

        if (!configuracion) {
            throw new NotFoundError("La configuración no existe");
        }

        return {
            configuracion
        };
    };

    obtenerSesion = async () => {
        return{ 
            sessionExpiringTime: (await this.obtenerConfiguracion()).configuracion.sessionExpiringTime
        }
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