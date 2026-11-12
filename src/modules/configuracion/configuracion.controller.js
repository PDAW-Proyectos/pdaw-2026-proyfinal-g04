export class ConfiguracionController {
    constructor(configuracionService) {
        this.configuracionService = configuracionService;
    }

    obtenerConfiguracion = async (req, res) => {
        const configuracion = await this.configuracionService.obtenerConfiguracion(req.body);
        res.status(200).json(configuracion);
    };

    obtenerSesion = async (req, res) => {
        const configuracion = await this.configuracionService.obtenerSesion(req.body);
        res.status(200).json(configuracion);
    };

    actualizarDuracionSesion = async (req, res) => {
        const configuracion = await this.configuracionService.actualizarDuracionSesion(req.body);
        res.status(200).json(configuracion);
    };
}