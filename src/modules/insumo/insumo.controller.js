import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class InsumoController {
    constructor(insumoService) {
        this.insumoService = insumoService;
    }

    listarInsumos = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const insumos = await this.insumoService.listarInsumos(pagina, limite);
        res.status(200).json(insumos);
    }

    filtrarInsumos = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const insumos = await this.insumoService.filtrarInsumos(req.body, pagina, limite);
        res.status(200).json(insumos);
    }

    buscarInsumo = async (req, res) => {
        const insumo = await this.insumoService.buscarInsumo(req.params.id);
        res.status(200).json(insumo);
    }

    crearInsumo = async (req, res) => {
        const insumo = await this.insumoService.crearInsumo(req.body);
        res.status(201).json(insumo);
    }

    actualizarInsumo = async (req, res) => {
        const insumo = await this.insumoService.actualizarInsumo(req.params.id, req.body);
        res.status(200).json(insumo);
    }

    eliminarInsumo = async (req, res) => {
        await this.insumoService.eliminarInsumo(req.params.id);
        res.status(204).send();
    }
}
