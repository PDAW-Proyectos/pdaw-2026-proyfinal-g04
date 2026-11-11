import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class CajaController {
    constructor(cajaService) {
        this.cajaService = cajaService;
    }

    listarCajas = (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const resultado = this.cajaService.listarCajas(pagina, limite);
        res.status(200).json(resultado);
    };

    filtrarCajas = (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const resultado = this.cajaService.filtrarCajas(req.body, pagina, limite);
        res.status(200).json(resultado);
    };

    buscarCaja = (req, res) => {
        const caja = this.cajaService.buscarCaja(req.params.id);
        res.status(200).json(caja);
    };

    crearCaja = async (req, res) => {
        const caja = await this.cajaService.crearCaja(req.body);
        res.status(201).json(caja);
    };

    registrarVenta = async (req, res, next) => {
        const venta = await this.cajaService.registrarVenta(req.params.id, req.session.userId, req.body);
        res.status(201).json(venta);
    };

    actualizarCaja = async (req, res) => {
        const caja = await this.cajaService.actualizarCaja(req.params.id, req.body);
        res.status(200).json(caja);
    };

    cerrarCaja = async (req, res) => {
        const caja = await this.cajaService.cerrarCaja(req.params.id, req.body, req.session.userId);
        res.status(200).json(caja);
    };

    eliminarCaja = async (req, res) => {
        await this.cajaService.eliminarCaja(req.params.id);
        res.status(204).end();
    };
}