import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";

export class ProveedorController {
    constructor(proveedorService) {
        this.proveedorService = proveedorService;
    }

    listarProveedores = async (req, res) => {
        const { pagina, limite } = validarPaginacion(req.query);
        const proveedores = await this.proveedorService.listarProveedores(pagina, limite);
        res.status(200).json(proveedores);
    };

    buscarProveedor = async (req, res) => {
        const proveedor = await this.proveedorService.buscarProveedor(req.params.id);
        res.status(200).json(proveedor);
    };

    crearProveedor = async (req, res) => {
        const proveedor = await this.proveedorService.crearProveedor(req.body);
        res.status(201).json(proveedor);
    };

    actualizarProveedor = async (req, res) => {
        const proveedor = await this.proveedorService.actualizarProveedor(req.params.id, req.body);
        res.status(200).json(proveedor);
    };

    eliminarProveedor = async (req, res) => {
        await this.proveedorService.eliminarProveedor(req.params.id);
        res.status(204).send();
    };
}
