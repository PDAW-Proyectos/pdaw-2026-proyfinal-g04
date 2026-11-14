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

    actualizarConfiguracion = async (req, res) => {
        const configuracion =
            await this.configuracionService.actualizarConfiguracion(req.body);
        res.status(200).json({ configuracion });
    };

    obtenerStock = async (_req, res) => {
        const stock = await this.configuracionService.obtenerStock();
        res.status(200).json(stock);
    };

    listarCategorias = async (_req, res) => {
        const categorias = await this.configuracionService.listarCategorias();
        res.status(200).json({ categorias });
    };

    crearCategoria = async (req, res) => {
        const categoria = await this.configuracionService.crearCategoria(req.body?.nombre);
        res.status(201).json({ categoria });
    };

    eliminarCategoria = async (req, res) => {
        await this.configuracionService.eliminarCategoria(req.params.id);
        res.status(204).send();
    };
}