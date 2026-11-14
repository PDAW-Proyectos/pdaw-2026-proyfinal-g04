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

    obtenerNegocio = async (req, res) => {
        const configuracion = await this.configuracionService.obtenerNegocio(req.body);
        res.status(200).json(configuracion);
    };

    actualizarDuracionSesion = async (req, res) => {
        const configuracion = await this.configuracionService.actualizarDuracionSesion(req.body);
        res.status(200).json(configuracion);
    };

    actualizarNegocio = async (req, res) => {
        const configuracion = await this.configuracionService.actualizarNegocio(req.body);
        res.status(200).json({ configuracion });
    };

    actualizarExpiracion = async (req, res) => {
        const configuracion = await this.configuracionService.actualizarExpiracion(req.body.sessionDurationMinutes);
        res.status(200).json({ configuracion });
    };

    actualizarStock = async (req, res) => {
        const configuracion = await this.configuracionService.actualizarStock(req.body);
        res.status(200).json({ configuracion });
    };

    obtenerStock = async (_req, res) => {
        const stock = await this.configuracionService.obtenerStock();
        res.status(200).json(stock);
    }; 
}