export class IngresoController {
    ingresoService;

    constructor(ingresoService) {
        this.ingresoService = ingresoService;
    }

    listarIngresos = async (req, res, next) => {
        try {
            const ingresos = await this.ingresoService.listarIngresos();
            res.status(200).json(ingresos);
        } catch (error) {
            next(error);
        }
    }

    buscarIngreso = async (req, res, next) => {
        try { 
            const ingresos = await this.ingresoService.buscarIngreso(req.params.id);
            res.status(200).json(ingresos);
        } catch (error) {
            next(error);
        }
    }

    crearIngreso = async (req, res, next) => {
        try {
            const ingresos = await this.ingresoService.crearIngreso(req.body);
            res.status(201).json(ingresos);
        } catch (error) {
            next(error);
        }
    }

    actualizarIngreso = async (req, res, next) => {
        try {
            const ingresos = await this.ingresoService.actualizarIngreso(
                req.params.id,
                req.body
            );

            res.status(200).json(ingresos);
        } catch (error) {
            next(error);
        }
    }

    eliminarIngreso = async (req, res, next) => {
        try {
            await this.ingresoService.eliminarIngreso(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
