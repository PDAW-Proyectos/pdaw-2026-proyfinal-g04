

export class EgresoController {
    egresoService;

    constructor(egresoService) {
        this.egresoService = egresoService;
    }

    listarEgresos = async (req, res, next) => {
        try {
            const egresos = await this.egresoService.listarEgresos();
            res.status(200).json(egresos);
        } catch (error) {
            next(error);
        }
    }

    buscarEgreso = async (req, res, next) => {
        try { 
            const egresos = await this.egresoService.buscarEgreso(req.params.id);
            res.status(200).json(egresos);
        } catch (error) {
            next(error);
        }
    }

    crearEgreso = async (req, res, next) => {
        try {
            const egresos = await this.egresoService.crearEgreso(req.body);
            res.status(201).json(egresos);
        } catch (error) {
            next(error);
        }
    }

    actualizarEgreso = async (req, res, next) => {
        try {
            const egresos = await this.egresoService.actualizarEgreso(
                req.params.id,
                req.body
            );

            res.status(200).json(egresos);
        } catch (error) {
            next(error);
        }
    }

    eliminarEgreso = async (req, res, next) => {
        try {
            await this.egresoService.eliminarEgreso(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
