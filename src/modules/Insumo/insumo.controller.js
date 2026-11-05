import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class InsumoController {
    constructor(insumoService) {
        this.insumoService = insumoService;
    }

    listarInsumos = async (req, res, next) => {
        try {
            const { pagina, limite } = validarPaginacion(req.query)
            const insumos = await this.insumoService.listarInsumos(pagina, limite);
            res.status(200).json(insumos);
        } catch (error) {
            next(error);
        }
    }

    filtrarInsumos = async (req, res, next) => {
        try {
            const { pagina, limite } = validarPaginacion(req.query) 
            const insumos = await this.insumoService.filtrarInsumos(req.body, pagina, limite);
            res.status(200).json(insumos);
        } catch (error) {
            next(error);
        }
    }

    buscarInsumo = async (req, res, next) => {
        try {
            const insumo = await this.insumoService.buscarInsumo(req.params.id);
            res.status(200).json(insumo);
        } catch (error) {
            next(error);
        }
    }

    crearInsumo = async (req, res, next) => {
        try {
            const insumo = await this.insumoService.crearInsumo(req.body);
            res.status(201).json(insumo);
        } catch (error) {
            next(error);
        }
    }

    actualizarInsumo = async (req, res, next) => {
        try {
            const insumo = await this.insumoService.actualizarInsumo(req.params.id, req.body);
            res.status(200).json(insumo);
        } catch (error) {
            next(error);
        }
    }

    eliminarInsumo = async (req, res, next) => {
        try {
            await this.insumoService.eliminarInsumo(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
