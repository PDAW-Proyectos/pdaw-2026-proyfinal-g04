export class ProductoController {
  constructor(productoService) {
    this.productoService = productoService;
  }

  listarProductos = async (req, res, next) => {
    try {
      const producto = this.productoService.listarProductos();
      res.status(200).json(producto);
    } catch (error) {
      next(error);
    }
  };

  buscarProducto = async (req, res, next) => {
    try {
      const producto = this.productoService.buscarProducto(req.params.id);
      res.status(200).json(producto);
    } catch (error) {
      next(error);
    }
  };

  crearProducto = async (req, res, next) => {
    try {
      const producto = await this.productoService.crearProducto(req.body);
      res.status(201).json(producto);
    } catch (error) {
      next(error);
    }
  };

  actualizarProducto = async (req, res, next) => {
    try {
      const producto = await this.productoService.actualizarProducto(
        req.params.id,
        req.body,
      );
      res.status(200).json(producto);
    } catch (error) {
      next(error);
    }
  };

  actualizarPreciosMasivo = async (req, res, next) => {
    try {
      const { productos } = req.body;

      if (!productos || !Array.isArray(productos)) {
        const error = new Error("El formato de productos es inválido");
        error.status = 400;
        throw error;
      }

      await this.productoService.actualizarPreciosMasivo(productos);
      res
        .status(200)
        .json({ message: "Precios y cotización actualizados correctamente" });
    } catch (error) {
      next(error);
    }
  };

  eliminarProducto = async (req, res, next) => {
    try {
      await this.productoService.eliminarProducto(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
