import { InsumoService } from "./insumo.service.js";

export class InsumoController {
    insumoService;

    constructor(insumoService) {
        this.insumoService = insumoService;
    }

    listarInsumos = async (req, res, next) => {
        try {
            const insumo = await this.insumoService.listarInsumos();
            res.status(200).json(insumo);
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
