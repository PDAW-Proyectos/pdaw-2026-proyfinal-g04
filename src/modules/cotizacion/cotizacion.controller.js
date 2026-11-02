
export class CotizacionController {
    cotizacionService;

    constructor(cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    consultarCotizacion = async (req, res, next) => {
        try {
            const cotizacion = await this.cotizacionService.consultarCotizacion();
            res.status(200).json(cotizacion);
        } catch (error) {
            next(error);
        }
    }

    listarCotizaciones = async (req, res, next) => {
        try {
            const cotizaciones = await this.cotizacionService.listarCotizaciones();
            res.status(200).json(cotizaciones);
        } catch (error) {
            next(error);
        }
    }

    buscarCotizacion = async (req, res, next) => {
        try { 
            const cotizacion = await this.cotizacionService.buscarCotizacion(req.params.id);
            res.status(200).json(cotizacion);
        } catch (error) {
            next(error);
        }
    }
}