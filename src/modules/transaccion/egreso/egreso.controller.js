import { validarPaginacion } from "../../../common/utils/validarPaginacion.util.js";

export class EgresoController {
    egresoService;

    constructor(egresoService) {
        this.egresoService = egresoService;
    }

    listarEgresos = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const egresos = await this.egresoService.listarEgresos(pagina, limite);
        res.status(200).json(egresos);
    }

    filtrarEgresos = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const egresos = await this.egresoService.filtrarEgresos(req.body, pagina, limite);
        res.status(200).json(egresos);
    }

    buscarEgreso = async (req, res) => {
        const egreso = await this.egresoService.buscarEgreso(req.params.id);
        res.status(200).json(egreso);
    }

    crearEgreso = async (req, res) => {
        const egreso = await this.egresoService.crearEgreso(req.body);
        res.status(201).json(egreso);
    }

    crearCompra = async (req, res) => {
        const egreso = await this.egresoService.crearCompra(req.session.userId, req.body);
        res.status(201).json(egreso);
    }

    actualizarEgreso = async (req, res) => {
        const egreso = await this.egresoService.actualizarEgreso(req.params.id, req.body);
        res.status(200).json(egreso);
    }

    eliminarEgreso = async (req, res) => {
        await this.egresoService.eliminarEgreso(req.params.id);
        res.status(204).send();
    }
}