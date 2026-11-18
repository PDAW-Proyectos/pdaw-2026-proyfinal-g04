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
    const idUsuario = req.session?.userId ?? null;
    const producto = await this.productoService.crearProducto(req.body, idUsuario);
    res.status(201).json(producto);
  };

  actualizarProducto = async (req, res) => {
    const idUsuario = req.session?.userId ?? null;
    const producto = await this.productoService.actualizarProducto(req.params.id, req.body, idUsuario);
    res.status(200).json(producto);
  }

  actualizarPreciosMasivo = async (req, res) => {
    const { productosActualizar } = req.body;

    if (!productosActualizar) {
      throw new BadRequestError("Faltan los productos para actualizar los precios");
    }

    const modificados = await this.productoService.actualizarPreciosMasivo(productosActualizar);
    
    res.status(200).json({ 
      message: "Precios actualizados correctamente", 
      modificados 
    });
  };

  actualizarPreciosPorcentaje = async (req, res) => {
    const { porcentaje, productosActualizar } = req.body;

    if (!porcentaje || productosActualizar === undefined) {
      throw new BadRequestError("Faltan el porcentaje o los productos para actualizar los precios");
    }

    const modificados = await this.productoService.actualizarPreciosPorcentaje(porcentaje, productosActualizar);
    
    res.status(200).json({ 
      message: "Precios actualizados correctamente", 
      modificados 
    });
  };

  eliminarProducto = async (req, res) => {
    await this.productoService.eliminarProducto(req.params.id);
    res.status(204).send();
  };
}
