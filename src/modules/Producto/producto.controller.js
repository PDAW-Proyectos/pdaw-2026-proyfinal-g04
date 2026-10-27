import { ProductoService } from "./producto.service.js";

export class ProductoController {
    productoService;

    constructor(productoService) {
        this.productoService = productoService;
    }

    listarProductos = async (req, res, next) => {
        try {
            const producto = await this.productoService.listarProductos();
            res.status(200).json(producto);
        } catch (error) {
            next(error);
        }
    }

    buscarProducto = async (req, res, next) => {
        try {
            const producto = await this.productoService.buscarProducto(req.params.id);
            res.status(200).json(producto);
        } catch (error) {
            next(error);
        }
    }

    crearProducto = async (req, res, next) => {
        try {
            const producto = await this.productoService.crearProducto(req.body);
            res.status(201).json(producto);
        } catch (error) {
            next(error);
        }
    }

    actualizarProducto = async (req, res, next) => {
        try {
            const producto = await this.productoService.actualizarProducto(req.params.id, req.body);
            res.status(200).json(producto);
        } catch (error) {
            next(error);
        }
    }

    eliminarProducto = async (req, res, next) => {
        try {
            await this.productoService.eliminarProducto(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
