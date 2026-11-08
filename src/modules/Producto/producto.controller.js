import { validarPaginacion } from "../../common/utils/validarPaginacion.util.js";
import { BadRequestError } from "../../common/errors/errors.classes.js";

export class ProductoController {
  constructor(productoService) {
    this.productoService = productoService;
  }

  listarProductos = async (req, res) => {
      const { pagina, limite } = validarPaginacion(req.query);
      const producto = await this.productoService.listarProductos(pagina, limite);
      res.status(200).json(producto);
  }

  filtrarProductos = async (req, res) => {
      const { pagina, limite } = validarPaginacion(req.query);
      const producto = await this.productoService.filtrarProductos(req.body, pagina, limite);
      res.status(200).json(producto);
  }
      
  buscarProducto = async (req, res) => {
    const producto = await this.productoService.buscarProducto(req.params.id);
    res.status(200).json(producto);
  };

  crearProducto = async (req, res) => {
    const producto = await this.productoService.crearProducto(req.body);
    res.status(201).json(producto);
  };

  actualizarProducto = async (req, res) => {
    const producto = await this.productoService.actualizarProducto(req.params.id, req.body);
    res.status(200).json(producto);
  };

  actualizarPreciosMasivo = async (req, res) => {
    const { productos } = req.body;

    if (!Array.isArray(productos)) {
      throw new BadRequestError("El formato de productos es inválido");
    }

    await this.productoService.actualizarPreciosMasivo(productos);
    res.status(200).json({ message: "Precios y cotización actualizados correctamente" });
  };

  eliminarProducto = async (req, res) => {
    await this.productoService.eliminarProducto(req.params.id);
    res.status(204).send();
  };
}
