import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class TransaccionesController {
    constructor(transaccionesService) {
        this.transaccionesService = transaccionesService;
    }

    listarTransacciones = (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const resultado = this.transaccionesService.listarTransacciones(pagina, limite);

        res.status(200).json(resultado);
    };

    filtrarTransacciones = (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const resultado = this.transaccionesService.filtrarTransacciones(
            req.body ?? {},
            pagina,
            limite
        );

        res.status(200).json(resultado);
    };

    buscarTransaccion = (req, res) => {
        const transaccion = this.transaccionesService.buscarTransaccion(req.params.id);

        res.status(200).json(transaccion);
    };
}