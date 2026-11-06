import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class CotizacionController {
    cotizacionService;

    constructor(cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    consultarCotizacion = async (req, res) => {
        const cotizacion = await this.cotizacionService.consultarCotizacion();

        return res.status(200).json(cotizacion);
    };

    listarCotizaciones = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query)        
        const cotizaciones = await this.cotizacionService.listarCotizaciones(pagina, limite);

        return res.status(200).json(cotizaciones);
    };

    buscarCotizacion = async (req, res) => {
        const cotizacion = await this.cotizacionService.buscarCotizacion(req.params.id);

        return res.status(200).json(cotizacion);
    };
}
