import { validarPaginacion } from "../../../common/utils/validarPaginacion.util.js";

export class IngresoController {
    ingresoService;

    constructor(ingresoService) {
        this.ingresoService = ingresoService;
    }

    listarIngresos = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const ingresos = await this.ingresoService.listarIngresos(pagina, limite);
        res.status(200).json(ingresos);
    }

    filtrarIngresos = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const ingresos = await this.ingresoService.filtrarIngresos(req.body, pagina, limite);
        res.status(200).json(ingresos);
    }

    buscarIngreso = async (req, res) => {
        const ingresos = await this.ingresoService.buscarIngreso(req.params.id);
        res.status(200).json(ingresos);
    }

    crearIngreso = async (req, res) => {
        const ingresos = await this.ingresoService.crearIngreso(req.body);
        res.status(201).json(ingresos);
    }

    crearVenta = async (req, res) => {
        const ingreso = await this.ingresoService.crearVenta(req.session.userId, req.body);
        res.status(201).json(ingreso);
    };  

    actualizarIngreso = async (req, res) => {
        const ingresos = await this.ingresoService.actualizarIngreso(req.params.id, req.body);
        res.status(200).json(ingresos);
    }

    eliminarIngreso = async (req, res) => {
        await this.ingresoService.eliminarIngreso(req.params.id);
        res.status(204).send();
    }
}