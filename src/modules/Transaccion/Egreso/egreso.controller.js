import { validarPaginacion } from "../../../common/utils/validarPaginacion.util.js";


export class EgresoController {
    egresoService;

    constructor(egresoService) {
        this.egresoService = egresoService;
    }

    listarEgresos = async (req, res, next) => {
        try {
            const { pagina, limite } = validarPaginacion(req.query) 
            const egresos = this.egresoService.listarEgresos(pagina, limite);
            res.status(200).json(egresos);
        } catch (error) {
            next(error);
        }
    }

    filtrarUsuarios = async (req, res, next) => {
        try {
            const { pagina, limite } = validarPaginacion(req.query) 
            const egresos = this.egresoService.filtrarEgresos(req.body, pagina, limite);
            res.status(200).json(egresos);
        } catch (error) {
            next(error);
        }
    }

    buscarEgreso = async (req, res, next) => {
        try { 
            const egreso = this.egresoService.buscarEgreso(req.params.id);
            res.status(200).json(egreso);
        } catch (error) {
            next(error);
        }
    }

    crearEgreso = async (req, res, next) => {
        try {
            const egreso = await this.egresoService.crearEgreso(req.body);
            res.status(201).json(egreso);
        } catch (error) {
            next(error);
        }
    }

    crearCompra = async (req, res, next) => {
        try {
            const egreso = await this.egresoService.crearCompra(req.session.userId, req.body);
            res.status(201).json(egreso);
        } catch (error) {
            next(error);
        }
    }

    actualizarEgreso = async (req, res, next) => {
        try {
            const egreso = await this.egresoService.actualizarEgreso(
                req.params.id,
                req.body
            );

            res.status(200).json(egreso);
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
